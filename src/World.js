/**
 * World.js - Enhanced 3D Scene Orchestrator
 * Manages the Three.js scene, renderer, lighting, and all world objects
 * With rim lighting, quality presets, post-processing, and particle systems
 */

import * as THREE from 'three';
import { Camera } from './Camera.js';
import { Player } from './Player.js';
import { Street } from './environment/Street.js';
import { Planet } from './environment/Planet.js';
import { SkyShader } from './shaders/sky.js';
import { PostProcessing } from './effects/PostProcessing.js';
import { ParticleManager } from './effects/particles/ParticleManager.js';
import { createFireflyEmitter, createLeafEmitter } from './effects/particles/Emitters.js';
import { LODManager } from './optimization/LODManager.js';
import { useGameStore } from './stores/gameStore.js';
import { createAudioManager, getAudioManager } from './audio/AudioManager.js';
import { NPCManager } from './entities/NPCManager.js';

// Quality presets - enhanced for messenger.abeto.co parity
const QUALITY_PRESETS = {
  high: {
    shadowMapSize: 2048,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    bloomEnabled: true,
    ssaoEnabled: true, // Enabled for high quality
    antialias: true,
  },
  medium: {
    shadowMapSize: 1024,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    bloomEnabled: true,
    ssaoEnabled: false,
    antialias: true,
  },
  low: {
    shadowMapSize: 512,
    pixelRatio: 1,
    bloomEnabled: false,
    ssaoEnabled: false,
    antialias: false,
  },
};

export class World {
  constructor(canvas, inputManager, options = {}) {
    this.canvas = canvas;
    this.inputManager = inputManager;
    this.onLoadProgress = null;

    // World mode: 'planet' (tiny planet) or 'street' (flat street - legacy)
    this.worldMode = options.worldMode || 'planet';

    // Three.js core
    this.scene = null;
    this.renderer = null;

    // World components
    this.camera = null;
    this.player = null;
    this.street = null;      // Legacy flat street
    this.planetEnv = null;   // New planet environment
    this.tinyPlanet = null;  // TinyPlanet system for movement
    this.sky = null;
    this.postProcessing = null;

    // Particle system
    this.particleManager = null;
    this.fireflyEmitter = null;
    this.leafEmitters = [];

    // LOD system
    this.lodManager = null;

    // Audio system
    this.audioManager = null;

    // NPC system
    this.npcManager = null;

    // Lighting
    this.ambientLight = null;
    this.directionalLight = null;
    this.hemisphereLight = null;
    this.rimLight = null; // Back-light for rim lighting effect

    // Light direction (synced with sun)
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();

    // Time of day (0 = day, 1 = night)
    this.timeOfDay = 0;

    // Collision geometry for BVH
    this.collisionMeshes = [];

    // Quality preset
    this.qualityLevel = this.detectQuality();
  }

  /**
   * Detect appropriate quality level based on device capabilities
   * @returns {string} 'low', 'medium', or 'high'
   */
  detectQuality() {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      return 'low';
    }

    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return 'low';
    }

    // Check for high-end GPU hints
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const isIntegrated = /Intel|Mali|Adreno/i.test(renderer);
      const isHighEnd = /NVIDIA|AMD|Radeon|GeForce/i.test(renderer);

      if (isHighEnd && !isIntegrated) {
        return 'high';
      } else if (isIntegrated) {
        return 'medium';
      }
    }

    // Default to medium
    return 'medium';
  }

  async init() {
    this.reportProgress(0, 'Initializing renderer...');

    const preset = QUALITY_PRESETS[this.qualityLevel];

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: preset.antialias,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(preset.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Day sky color

    this.reportProgress(0.1, 'Setting up lighting...');
    this.setupLighting(preset);

    this.reportProgress(0.2, 'Creating sky...');
    this.setupSky();

    this.reportProgress(0.3, 'Building environment...');
    if (this.worldMode === 'planet') {
      await this.setupPlanet();
    } else {
      await this.setupStreet();
    }

    this.reportProgress(0.6, 'Spawning player...');
    this.setupPlayer();

    this.reportProgress(0.7, 'Spawning NPCs...');
    this.setupNPCs();

    this.reportProgress(0.8, 'Setting up camera...');
    this.setupCamera();

    this.reportProgress(0.85, 'Initializing post-processing...');
    this.setupPostProcessing(preset);

    this.reportProgress(0.9, 'Setting up particles and LOD...');
    this.setupParticles();
    this.setupLOD();

    this.reportProgress(0.95, 'Initializing audio...');
    await this.setupAudio();

    this.reportProgress(1.0, 'Ready!');

    // Listen for day/night toggle
    this.inputManager.on('toggleDayNight', () => this.toggleDayNight());

    // Store quality level
    useGameStore.getState().setQualityLevel(this.qualityLevel);
  }

  reportProgress(progress, message) {
    if (this.onLoadProgress) {
      this.onLoadProgress(progress, message);
    }
  }

  setupLighting(preset) {
    // Ambient light - reduced for dramatic cel-shading shadows
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);

    // Hemisphere light for natural sky/ground color blending
    // Reduced intensity for more dramatic shadows
    this.hemisphereLight = new THREE.HemisphereLight(
      0x87CEEB, // Sky color
      0x4A4063, // Ground color (shadow purple from spec)
      0.4       // Reduced from 0.6 for darker shadows
    );
    this.scene.add(this.hemisphereLight);

    // Main directional light (sun) - increased intensity for dramatic lighting
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    // Position sun lower for more dramatic shadows
    this.directionalLight.position.set(40, 60, 30);
    this.directionalLight.castShadow = true;

    // Shadow configuration - enhanced for soft shadows
    this.directionalLight.shadow.mapSize.width = preset.shadowMapSize;
    this.directionalLight.shadow.mapSize.height = preset.shadowMapSize;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.bias = -0.0001;
    this.directionalLight.shadow.radius = 3; // Soft shadow edges

    this.scene.add(this.directionalLight);

    // Rim light (back-light) for silhouette edge lighting
    // From spec: Position at (-50, 50, -50)
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.rimLight.position.set(-50, 50, -50);
    this.rimLight.castShadow = false; // Rim light doesn't need shadows
    this.scene.add(this.rimLight);

    // Update light direction
    this.lightDirection.copy(this.directionalLight.position).normalize();
  }

  setupSky() {
    this.sky = new SkyShader(this.scene);

    // Sync light direction with sky's sun direction
    if (this.sky) {
      const sunDir = this.sky.getSunDirection();
      this.updateLightDirection(sunDir);
    }
  }

  async setupStreet() {
    this.street = new Street(this.scene);
    this.street.setLightDirection(this.lightDirection);
    await this.street.init();

    // Collect collision meshes from street
    this.collisionMeshes = this.street.getCollisionMeshes();
  }

  async setupPlanet() {
    // Create planet environment
    this.planetEnv = new Planet(this.scene, 50); // 50 unit radius
    this.planetEnv.setLightDirection(this.lightDirection);
    await this.planetEnv.init();

    // Get the TinyPlanet system for player/camera
    this.tinyPlanet = this.planetEnv.getPlanet();

    // Collect collision meshes from planet
    this.collisionMeshes = this.planetEnv.getCollisionMeshes();

    // Update sky color for planet mode (more turquoise)
    this.scene.background = new THREE.Color(0x5BC0BE);
  }

  setupPlayer() {
    if (this.worldMode === 'planet') {
      // Spawn on planet surface at front/center
      const spawnPosition = this.tinyPlanet.latLonToPosition(0, 0);
      this.player = new Player(this.scene, this.inputManager, spawnPosition, this.tinyPlanet);
    } else {
      // Spawn position at the south end of the street (legacy)
      const spawnPosition = new THREE.Vector3(0, 0, 20);
      this.player = new Player(this.scene, this.inputManager, spawnPosition, null);
    }

    this.player.setCollisionMeshes(this.collisionMeshes);
    this.player.setLightDirection(this.lightDirection);
  }

  setupCamera() {
    if (this.worldMode === 'planet') {
      this.camera = new Camera(this.player, this.collisionMeshes, this.tinyPlanet);
    } else {
      this.camera = new Camera(this.player, this.collisionMeshes, null);
    }
    this.camera.init();
  }

  setupNPCs() {
    // Only spawn NPCs on planet mode
    if (this.worldMode === 'planet' && this.tinyPlanet) {
      this.npcManager = new NPCManager(this.scene, this.tinyPlanet, {
        maxNPCs: 6, // Limit NPCs for performance
        enabled: true,
      });

      // Sync light direction
      if (this.lightDirection) {
        this.npcManager.setLightDirection(this.lightDirection);
      }
    }
  }

  setupPostProcessing(preset) {
    this.postProcessing = new PostProcessing(
      this.renderer,
      this.scene,
      this.camera.camera
    );

    // Apply quality preset
    this.postProcessing.setQualityPreset(this.qualityLevel);
  }

  setupParticles() {
    // Initialize particle manager
    this.particleManager = new ParticleManager(this.scene, {
      quality: this.qualityLevel,
    });

    // Create ambient leaf emitters (bounds depend on world mode)
    const bounds = this.worldMode === 'planet'
      ? { min: { x: -30, y: 5, z: -30 }, max: { x: 30, y: 20, z: 30 } }
      : { min: { x: -50, y: 5, z: -50 }, max: { x: 50, y: 15, z: 50 } };

    this.leafEmitters = createLeafEmitter(
      this.particleManager,
      bounds,
      this.qualityLevel === 'low' ? 10 : 30
    );

    // Create firefly emitter (activated at night)
    const fireflyBounds = {
      min: new THREE.Vector3(-40, 0.5, -40),
      max: new THREE.Vector3(40, 4, 40),
    };
    this.fireflyEmitter = createFireflyEmitter(
      this.particleManager,
      fireflyBounds,
      this.qualityLevel === 'low' ? 15 : 40
    );

    // Store particle manager for player to access
    if (this.player) {
      this.player.particleManager = this.particleManager;
    }
  }

  setupLOD() {
    // Initialize LOD manager with camera
    this.lodManager = new LODManager(this.camera.camera);

    // Note: LOD objects would be added here for complex meshes
    // For now, the environment uses simple geometry that doesn't need LOD
  }

  async setupAudio() {
    // Create audio manager
    this.audioManager = createAudioManager(this.camera);

    // Set up first user interaction handler to initialize and start audio
    // (Browser autoplay policy requires user interaction before playing audio)
    const startAudioOnInteraction = async () => {
      if (this.audioManager && !this.audioManager.initialized) {
        await this.audioManager.init();
        this.audioManager.startMusic();
        useGameStore.getState().setAudioInitialized(true);
      }
      // Remove listeners after first interaction
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
    };

    // Listen for any user interaction to start audio
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);
  }

  /**
   * Update light direction (syncs with sun)
   * @param {THREE.Vector3} direction
   */
  updateLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();

    // Update directional light position
    this.directionalLight.position.copy(direction).multiplyScalar(100);

    // Update rim light (opposite side)
    this.rimLight.position.copy(direction).negate().multiplyScalar(50);
    this.rimLight.position.y = Math.abs(this.rimLight.position.y);

    // Update player
    if (this.player) {
      this.player.setLightDirection(direction);
    }

    // Update NPCs
    if (this.npcManager) {
      this.npcManager.setLightDirection(direction);
    }

    // Update environment
    if (this.worldMode === 'planet' && this.planetEnv) {
      this.planetEnv.setLightDirection(direction);
    } else if (this.street) {
      this.street.setLightDirection(direction);
    }
  }

  /**
   * Set quality preset
   * @param {string} quality 'low', 'medium', or 'high'
   */
  setQuality(quality) {
    if (!QUALITY_PRESETS[quality]) return;

    this.qualityLevel = quality;
    const preset = QUALITY_PRESETS[quality];

    // Update renderer
    this.renderer.setPixelRatio(preset.pixelRatio);

    // Update shadow map size
    this.directionalLight.shadow.mapSize.width = preset.shadowMapSize;
    this.directionalLight.shadow.mapSize.height = preset.shadowMapSize;
    this.directionalLight.shadow.map?.dispose();
    this.directionalLight.shadow.map = null;

    // Update post-processing
    if (this.postProcessing) {
      this.postProcessing.setQualityPreset(quality);
    }

    // Update store
    useGameStore.getState().setQualityLevel(quality);
  }

  toggleDayNight() {
    const store = useGameStore.getState();
    const isNight = !store.isNight;
    store.setNight(isNight);

    // Animate time of day transition
    const targetTime = isNight ? 1 : 0;
    this.animateTimeOfDay(targetTime);
  }

  animateTimeOfDay(target) {
    // Simple lerp for now - can enhance with GSAP later
    const duration = 1.5; // seconds
    const startTime = this.timeOfDay;
    const startTimestamp = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTimestamp) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * t * (3 - 2 * t); // Smooth step

      this.timeOfDay = startTime + (target - startTime) * eased;
      this.updateTimeOfDay();

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  updateTimeOfDay() {
    // Interpolate colors based on time of day
    const dayColor = new THREE.Color(0x87CEEB);
    const nightColor = new THREE.Color(0x1E3A5F);

    const skyColor = dayColor.clone().lerp(nightColor, this.timeOfDay);
    this.scene.background = skyColor;

    // Adjust main light - keeping dramatic contrast
    const dayIntensity = 1.8;
    const nightIntensity = 0.3;
    this.directionalLight.intensity = THREE.MathUtils.lerp(
      dayIntensity,
      nightIntensity,
      this.timeOfDay
    );

    // Adjust rim light (more visible at dusk/dawn)
    const rimDayIntensity = 0.3;
    const rimNightIntensity = 0.1;
    this.rimLight.intensity = THREE.MathUtils.lerp(
      rimDayIntensity,
      rimNightIntensity,
      this.timeOfDay
    );

    // Adjust ambient - low for dramatic shadows
    this.ambientLight.intensity = THREE.MathUtils.lerp(0.2, 0.1, this.timeOfDay);

    // Adjust hemisphere light
    const dayGroundColor = new THREE.Color(0x4A4063);
    const nightGroundColor = new THREE.Color(0x1A1A2E);
    this.hemisphereLight.groundColor.copy(dayGroundColor).lerp(nightGroundColor, this.timeOfDay);

    // Update sky shader
    if (this.sky) {
      this.sky.setTimeOfDay(this.timeOfDay);

      // Get updated sun direction from sky
      const sunDir = this.sky.getSunDirection();
      this.updateLightDirection(sunDir);
    }

    // Update environment lights and neon
    if (this.worldMode === 'planet' && this.planetEnv) {
      this.planetEnv.setTimeOfDay(this.timeOfDay);
    } else if (this.street) {
      this.street.setTimeOfDay(this.timeOfDay);
    }

    // Update bloom intensity (stronger at night for neon)
    if (this.postProcessing) {
      const bloomBase = 0.25;  // Increased from 0.15
      const bloomNight = 0.4;  // Increased from 0.25
      this.postProcessing.setBloom({
        intensity: THREE.MathUtils.lerp(bloomBase, bloomNight, this.timeOfDay),
      });
    }

    // Update audio (music filter gets darker at night)
    if (this.audioManager && this.audioManager.initialized) {
      this.audioManager.setTimeOfDay(this.timeOfDay);
    }
  }

  update(deltaTime) {
    // Update player
    if (this.player) {
      this.player.update(deltaTime);
    }

    // Update camera
    if (this.camera) {
      this.camera.update(deltaTime);
    }

    // Update environment (animated elements)
    if (this.worldMode === 'planet' && this.planetEnv) {
      this.planetEnv.update(deltaTime);
    } else if (this.street) {
      this.street.update(deltaTime);
    }

    // Update NPCs
    if (this.npcManager) {
      // Sync player position for NPC look-at behavior
      if (this.player) {
        this.npcManager.setPlayerPosition(this.player.getPosition());
      }
      this.npcManager.update(deltaTime);
    }

    // Update particle systems
    if (this.particleManager) {
      this.particleManager.update(deltaTime);
    }

    // Update fireflies (only at night)
    if (this.fireflyEmitter) {
      const store = useGameStore.getState();
      this.fireflyEmitter.update(deltaTime, store.isNight);
    }

    // Update LOD system
    if (this.lodManager) {
      this.lodManager.update(deltaTime);
    }

    // Update post-processing (for film grain animation)
    if (this.postProcessing) {
      this.postProcessing.update(deltaTime);
    }

    // Update sky shader (for cloud animation)
    if (this.sky) {
      this.sky.update(deltaTime);
    }

    // Update audio
    if (this.audioManager) {
      this.audioManager.update(deltaTime);
    }

    // Render
    this.render();
  }

  render() {
    if (this.postProcessing && this.postProcessing.enabled) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera.camera);
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, QUALITY_PRESETS[this.qualityLevel].pixelRatio)
    );

    // Update camera
    if (this.camera) {
      this.camera.onResize(width, height);
    }

    // Update post-processing
    if (this.postProcessing) {
      this.postProcessing.onResize(width, height);
    }
  }

  dispose() {
    // Dispose of all components
    if (this.planetEnv) this.planetEnv.dispose();
    if (this.street) this.street.dispose();
    if (this.player) this.player.dispose();
    if (this.camera) this.camera.dispose();
    if (this.postProcessing) this.postProcessing.dispose();
    if (this.sky) this.sky.dispose();
    if (this.particleManager) this.particleManager.dispose();
    if (this.lodManager) this.lodManager.dispose();
    if (this.audioManager) this.audioManager.dispose();
    if (this.npcManager) this.npcManager.dispose();

    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
