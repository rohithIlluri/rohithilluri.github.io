/**
 * AudioManager.js - Main audio controller for the game
 * Handles background music, sound effects, and spatial audio
 *
 * Features:
 * - Background lo-fi music with day/night crossfade
 * - Positional sound effects (footsteps, ambient)
 * - Volume control and mute functionality
 * - Auto-pause on tab unfocus
 */

import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore.js';

// Audio file paths (will use Web Audio API with fetch)
const AUDIO_PATHS = {
  // Background music
  musicDay: '/assets/audio/lofi-day.mp3',
  musicNight: '/assets/audio/lofi-night.mp3',

  // Sound effects
  footstepGrass: '/assets/audio/sfx/footstep-grass.mp3',
  footstepPath: '/assets/audio/sfx/footstep-path.mp3',
  uiClick: '/assets/audio/sfx/ui-click.mp3',
  uiHover: '/assets/audio/sfx/ui-hover.mp3',
  buildingEnter: '/assets/audio/sfx/door-open.mp3',
  buildingExit: '/assets/audio/sfx/door-close.mp3',
  ambient: '/assets/audio/sfx/ambient-city.mp3',
};

// Fallback: Generate simple tones if audio files don't exist
const USE_GENERATED_AUDIO = true; // Set to false when real audio files are added

export class AudioManager {
  constructor(camera) {
    this.camera = camera;
    this.listener = null;
    this.audioLoader = null;

    // Audio sources
    this.musicDay = null;
    this.musicNight = null;
    this.ambientSound = null;
    this.sfxBuffers = new Map();

    // State
    this.initialized = false;
    this.musicPlaying = false;
    this.currentTimeOfDay = 0; // 0 = day, 1 = night

    // Volume settings (0-1)
    this.masterVolume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.ambientVolume = 0.3;

    // Footstep timing
    this.lastFootstepTime = 0;
    this.footstepInterval = 350; // ms between footsteps when walking
    this.runFootstepInterval = 200; // ms between footsteps when running

    // Audio context for generated sounds
    this.audioContext = null;

    // Bind methods
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  /**
   * Initialize the audio system
   * Must be called after user interaction (browser autoplay policy)
   */
  async init() {
    if (this.initialized) return;

    try {
      // Create Three.js audio listener
      this.listener = new THREE.AudioListener();
      if (this.camera && this.camera.camera) {
        this.camera.camera.add(this.listener);
      }

      // Create audio loader
      this.audioLoader = new THREE.AudioLoader();

      // Create Web Audio context for generated sounds
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Load audio files or generate fallbacks
      if (USE_GENERATED_AUDIO) {
        await this.initGeneratedAudio();
      } else {
        await this.loadAudioFiles();
      }

      // Set up visibility change listener (pause when tab hidden)
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      this.initialized = true;
      console.log('AudioManager initialized');

    } catch (error) {
      console.warn('AudioManager init failed:', error);
    }
  }

  /**
   * Initialize with generated audio (no external files needed)
   */
  async initGeneratedAudio() {
    // Create ambient drone sound
    this.createAmbientDrone();

    // Pre-generate SFX buffers
    this.sfxBuffers.set('footstepGrass', this.generateFootstepBuffer('grass'));
    this.sfxBuffers.set('footstepPath', this.generateFootstepBuffer('path'));
    this.sfxBuffers.set('uiClick', this.generateUIClickBuffer());

    // Create music oscillators (lo-fi style)
    this.createLofiMusic();
  }

  /**
   * Create ambient drone using oscillators
   */
  createAmbientDrone() {
    if (!this.audioContext) return;

    // Create gain node for ambient volume
    this.ambientGain = this.audioContext.createGain();
    this.ambientGain.gain.value = 0; // Start silent
    this.ambientGain.connect(this.audioContext.destination);

    // Create a subtle ambient drone (very low frequency)
    this.ambientOscillator = this.audioContext.createOscillator();
    this.ambientOscillator.type = 'sine';
    this.ambientOscillator.frequency.value = 60; // Low hum

    // Add filter for warmth
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    this.ambientOscillator.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientOscillator.start();
  }

  /**
   * Create lo-fi style background music using oscillators and noise
   */
  createLofiMusic() {
    if (!this.audioContext) return;

    // Music gain node
    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0; // Start silent
    this.musicGain.connect(this.audioContext.destination);

    // Create a simple chord progression (C - Am - F - G)
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];

    // Store oscillators for cleanup
    this.musicOscillators = [];

    // Create pad sound with multiple detuned oscillators
    chords[0].forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * 0.5; // One octave lower for warmth

      // Slight detune for richness
      osc.detune.value = (i - 1) * 5;

      // Individual gain for each note
      const noteGain = this.audioContext.createGain();
      noteGain.gain.value = 0.1;

      // Low pass filter for lo-fi feel
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start();
      this.musicOscillators.push({ osc, noteGain, filter, baseFreq: freq });
    });

    // Chord progression timer
    let chordIndex = 0;
    this.chordInterval = setInterval(() => {
      if (!this.musicPlaying) return;

      chordIndex = (chordIndex + 1) % chords.length;
      const chord = chords[chordIndex];

      this.musicOscillators.forEach((item, i) => {
        if (chord[i]) {
          item.osc.frequency.setTargetAtTime(
            chord[i] * 0.5,
            this.audioContext.currentTime,
            0.5 // Slow glide for lo-fi feel
          );
        }
      });
    }, 4000); // Change chord every 4 seconds
  }

  /**
   * Generate footstep sound buffer
   */
  generateFootstepBuffer(surface) {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Noise burst with fast decay
      const noise = (Math.random() * 2 - 1);
      const envelope = Math.exp(-t * 30); // Fast decay

      if (surface === 'grass') {
        // Softer, more muffled for grass
        data[i] = noise * envelope * 0.3;
      } else {
        // Sharper for path/concrete
        data[i] = noise * envelope * 0.5 * (1 + Math.sin(t * 1000) * 0.3);
      }
    }

    return buffer;
  }

  /**
   * Generate UI click sound buffer
   */
  generateUIClickBuffer() {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05; // 50ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    const freq = 1000; // Hz
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * Play a sound effect
   */
  playSFX(name, volume = 1.0) {
    if (!this.initialized || !this.audioContext) return;

    const buffer = this.sfxBuffers.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.sfxVolume * this.masterVolume * volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Play footstep sound based on surface
   */
  playFootstep(isRunning = false, surface = 'grass') {
    const now = performance.now();
    const interval = isRunning ? this.runFootstepInterval : this.footstepInterval;

    if (now - this.lastFootstepTime < interval) return;

    this.lastFootstepTime = now;
    const sfxName = surface === 'grass' ? 'footstepGrass' : 'footstepPath';

    // Play with pitch variation for natural feel
    const volume = 0.5 + Math.random() * 0.3;
    const pitchVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 playback rate
    this.playSFXWithPitch(sfxName, volume, pitchVariation);
  }

  /**
   * Play a sound effect with pitch variation
   */
  playSFXWithPitch(name, volume = 1.0, pitch = 1.0) {
    if (!this.initialized || !this.audioContext) return;

    const buffer = this.sfxBuffers.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch; // Pitch variation

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.sfxVolume * this.masterVolume * volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Play UI click sound
   */
  playUIClick() {
    this.playSFX('uiClick', 0.8);
  }

  /**
   * Start background music
   */
  startMusic() {
    if (!this.initialized || this.musicPlaying) return;

    this.musicPlaying = true;

    // Fade in music
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume * this.masterVolume * 0.3,
        this.audioContext.currentTime,
        1.0 // 1 second fade in
      );
    }

    // Fade in ambient
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(
        this.ambientVolume * this.masterVolume * 0.1,
        this.audioContext.currentTime,
        1.0
      );
    }

    console.log('Music started');
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (!this.musicPlaying) return;

    this.musicPlaying = false;

    // Fade out
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
    }
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
    }
  }

  /**
   * Update time of day (for music crossfade)
   * @param {number} time 0 = day, 1 = night
   */
  setTimeOfDay(time) {
    this.currentTimeOfDay = time;

    // Adjust music filter for night (darker, more muffled)
    // Wider range for more dramatic dreamy night feel (1000 → 300 Hz)
    if (this.musicOscillators && this.musicOscillators.length > 0) {
      const filterFreq = THREE.MathUtils.lerp(1000, 300, time); // More muffled at night
      this.musicOscillators.forEach(item => {
        if (item.filter) {
          item.filter.frequency.setTargetAtTime(
            filterFreq,
            this.audioContext.currentTime,
            1.0
          );
        }
      });
    }

    // Also adjust ambient filter
    if (this.ambientGain) {
      // Ambient gets slightly louder and warmer at night
      const ambientVol = this.ambientVolume * this.masterVolume * (0.1 + time * 0.05);
      this.ambientGain.gain.setTargetAtTime(
        this.musicPlaying ? ambientVol : 0,
        this.audioContext.currentTime,
        1.0
      );
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Update all volume levels
   */
  updateVolumes() {
    if (this.musicGain && this.musicPlaying) {
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume * this.masterVolume * 0.3,
        this.audioContext.currentTime,
        0.1
      );
    }
    if (this.ambientGain && this.musicPlaying) {
      this.ambientGain.gain.setTargetAtTime(
        this.ambientVolume * this.masterVolume * 0.1,
        this.audioContext.currentTime,
        0.1
      );
    }
  }

  /**
   * Handle tab visibility change
   */
  onVisibilityChange() {
    if (document.hidden) {
      // Pause audio when tab is hidden
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend();
      }
    } else {
      // Resume audio when tab is visible
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }
  }

  /**
   * Resume audio context (call after user interaction)
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load actual audio files (when available)
   */
  async loadAudioFiles() {
    // TODO: Implement when real audio files are added
    // For now, use generated audio
    await this.initGeneratedAudio();
  }

  /**
   * Update method (call each frame)
   */
  update(deltaTime) {
    // Could add audio-reactive effects here
  }

  /**
   * Dispose of all audio resources
   */
  dispose() {
    // Stop music
    this.stopMusic();

    // Clear interval
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
    }

    // Stop oscillators
    if (this.musicOscillators) {
      this.musicOscillators.forEach(item => {
        item.osc.stop();
      });
    }

    if (this.ambientOscillator) {
      this.ambientOscillator.stop();
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Remove event listener
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    // Remove listener from camera
    if (this.listener && this.camera && this.camera.camera) {
      this.camera.camera.remove(this.listener);
    }

    this.initialized = false;
  }
}

// Singleton instance
let audioManagerInstance = null;

export function getAudioManager() {
  return audioManagerInstance;
}

export function createAudioManager(camera) {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager(camera);
  }
  return audioManagerInstance;
}
