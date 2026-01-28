/**
 * Messenger Clone - Main Entry Point
 * Mail delivery game on a tiny planet inspired by messenger.abeto.co
 * Initializes the 3D world and handles the application lifecycle
 */

import * as THREE from 'three';
import { World } from './World.js';
import { InputManager } from './InputManager.js';
import { useGameStore } from './stores/gameStore.js';
import { UIManager } from './ui/UIManager.js';

/**
 * Loading Planet Preview - Mini scene for the loading screen
 * Creates a rotating cel-shaded planet with buildings
 */
class LoadingPlanetPreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planet = null;
    this.isRunning = false;
  }

  init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(400, 400); // Larger planet preview (messenger.abeto.co style)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0.5, 4);
    this.camera.lookAt(0, 0, 0);

    // Create planet group
    this.planet = new THREE.Group();
    this.scene.add(this.planet);

    // Create the planet sphere (earth-like with grass texture)
    const planetGeo = new THREE.SphereGeometry(1, 32, 32);
    const planetMat = new THREE.MeshToonMaterial({
      color: 0x7CB342, // Grass green
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    this.planet.add(planetMesh);

    // Create 4-band gradient map for cel-shading effect
    const gradientColors = new Uint8Array([40, 80, 140, 200]);
    const gradientTexture = new THREE.DataTexture(gradientColors, 4, 1, THREE.RedFormat);
    gradientTexture.needsUpdate = true;
    planetMat.gradientMap = gradientTexture;

    // Add mini buildings on the planet
    this.addMiniBuildings();

    // Add mini trees
    this.addMiniTrees();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 3, 3);
    this.scene.add(directionalLight);

    // Rim light for nice edge highlight
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-2, 2, -2);
    this.scene.add(rimLight);

    this.start();
  }

  addMiniBuildings() {
    // Updated colors to match messenger.abeto.co palette
    const buildingColors = [0xE8DFD0, 0xE8D0C0, 0xC8D8C8, 0xD8D0E0, 0xD8A888, 0xB8D8D0];
    const positions = [
      { lat: 0, lon: 0 },
      { lat: 45, lon: 90 },
      { lat: -30, lon: 180 },
      { lat: 20, lon: -90 },
      { lat: 15, lon: 45 },
      { lat: -45, lon: -45 },
    ];

    positions.forEach((pos, i) => {
      const buildingGroup = new THREE.Group();

      // Building body
      const height = 0.15 + Math.random() * 0.1;
      const buildingGeo = new THREE.BoxGeometry(0.12, height, 0.1);
      const buildingMat = new THREE.MeshToonMaterial({
        color: buildingColors[i % buildingColors.length],
      });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.y = height / 2;
      buildingGroup.add(building);

      // Roof
      const roofGeo = new THREE.ConeGeometry(0.08, 0.06, 4);
      const roofMat = new THREE.MeshToonMaterial({ color: 0x8B4513 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = height + 0.03;
      roof.rotation.y = Math.PI / 4;
      buildingGroup.add(roof);

      // Position on sphere surface
      const phi = (90 - pos.lat) * Math.PI / 180;
      const theta = pos.lon * Math.PI / 180;
      const x = 1 * Math.sin(phi) * Math.cos(theta);
      const y = 1 * Math.cos(phi);
      const z = 1 * Math.sin(phi) * Math.sin(theta);

      buildingGroup.position.set(x, y, z);
      buildingGroup.lookAt(0, 0, 0);
      buildingGroup.rotateX(Math.PI / 2);

      this.planet.add(buildingGroup);
    });
  }

  addMiniTrees() {
    const treePositions = [
      { lat: 30, lon: 45 },
      { lat: -20, lon: -45 },
      { lat: 60, lon: 135 },
      { lat: -45, lon: -135 },
      { lat: 10, lon: -160 },
    ];

    treePositions.forEach((pos) => {
      const treeGroup = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.01, 0.015, 0.06, 6);
      const trunkMat = new THREE.MeshToonMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.03;
      treeGroup.add(trunk);

      // Foliage (cone)
      const foliageGeo = new THREE.ConeGeometry(0.04, 0.08, 6);
      const foliageMat = new THREE.MeshToonMaterial({ color: 0x2E7D32 });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 0.1;
      treeGroup.add(foliage);

      // Position on sphere surface
      const phi = (90 - pos.lat) * Math.PI / 180;
      const theta = pos.lon * Math.PI / 180;
      const x = 1 * Math.sin(phi) * Math.cos(theta);
      const y = 1 * Math.cos(phi);
      const z = 1 * Math.sin(phi) * Math.sin(theta);

      treeGroup.position.set(x, y, z);
      treeGroup.lookAt(0, 0, 0);
      treeGroup.rotateX(Math.PI / 2);

      this.planet.add(treeGroup);
    });
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    // Rotate planet slowly
    if (this.planet) {
      this.planet.rotation.y += 0.005;
      // Slight wobble for organic feel
      this.planet.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    }
  }
}

class App {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingText = document.getElementById('loading-text');
    this.loadingProgress = document.getElementById('loading-progress');
    this.beginButton = document.getElementById('begin-button');
    this.loadingPlanetCanvas = document.getElementById('loading-planet-canvas');
    this.hud = document.getElementById('hud');

    this.world = null;
    this.inputManager = null;
    this.uiManager = null;
    this.loadingPlanet = null;
    this.isRunning = false;
    this.isReady = false;
  }

  async init() {
    try {
      // Start the loading planet preview
      if (this.loadingPlanetCanvas) {
        this.loadingPlanet = new LoadingPlanetPreview(this.loadingPlanetCanvas);
        this.loadingPlanet.init();
      }

      // Initialize input manager first
      this.inputManager = new InputManager();

      // Initialize the 3D world
      this.world = new World(this.canvas, this.inputManager);

      // Set up loading progress callback
      this.world.onLoadProgress = (progress, message) => {
        this.updateLoadingProgress(progress, message);
      };

      // Initialize the world (loads assets, sets up scene)
      await this.world.init();

      // World is ready - show BEGIN button
      this.showBeginButton();

      // Set up window resize handler
      window.addEventListener('resize', () => this.onResize());

      console.log('Messenger clone initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError(error.message);
    }
  }

  updateLoadingProgress(progress, message) {
    if (this.loadingBar) {
      this.loadingBar.style.width = `${progress * 100}%`;
    }
    if (this.loadingText && message) {
      this.loadingText.textContent = message;
    }
  }

  showBeginButton() {
    this.isReady = true;

    // Hide loading progress
    if (this.loadingProgress) {
      this.loadingProgress.classList.add('hidden');
    }

    // Show BEGIN button
    if (this.beginButton) {
      this.beginButton.classList.remove('hidden');

      // Add click handler to start the game
      this.beginButton.addEventListener('click', () => this.onBeginClick());
    }
  }

  onBeginClick() {
    if (!this.isReady) return;

    // Stop the loading planet animation
    if (this.loadingPlanet) {
      this.loadingPlanet.dispose();
      this.loadingPlanet = null;
    }

    // Hide loading screen and show HUD
    this.hideLoadingScreen();

    // Start the render loop
    this.start();
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }
    if (this.hud) {
      this.hud.classList.remove('hidden');
    }
    useGameStore.getState().setLoaded(true);

    // Initialize UI Manager after game starts
    this.uiManager = new UIManager();
    this.uiManager.init();
  }

  showError(message) {
    if (this.loadingText) {
      this.loadingText.textContent = `Error: ${message}`;
      this.loadingText.style.color = '#ff6b6b';
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta to prevent huge jumps
    this.lastTime = currentTime;

    // Update the world
    if (this.world) {
      this.world.update(deltaTime);
    }

    // Update UI Manager (for any frame-based updates)
    if (this.uiManager) {
      this.uiManager.update(deltaTime);
    }
  }

  onResize() {
    if (this.world) {
      this.world.onResize();
    }
  }

  dispose() {
    this.stop();
    if (this.loadingPlanet) {
      this.loadingPlanet.dispose();
    }
    if (this.world) {
      this.world.dispose();
    }
    if (this.inputManager) {
      this.inputManager.dispose();
    }
    if (this.uiManager) {
      this.uiManager.dispose();
    }
  }
}

// Initialize the application when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for debugging
window.app = app;
