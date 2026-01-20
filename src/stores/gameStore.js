/**
 * gameStore.js - Global State Management with Zustand (Vanilla)
 * Manages application state including player position, UI state, and game settings
 */

import { createStore } from 'zustand/vanilla';
import * as THREE from 'three';

const store = createStore((set, get) => ({
  // Loading state
  isLoaded: false,
  loadProgress: 0,

  // Player state
  playerPosition: new THREE.Vector3(),

  // Time of day
  isNight: false,

  // Buildings data (portfolio sections)
  buildings: [
    {
      id: 'skills',
      name: 'Skills Brownstone',
      type: 'brownstone',
      position: new THREE.Vector3(15, 0, 0), // East side
      content: `
        <h3>Technical Skills</h3>
        <ul>
          <li><strong>Languages:</strong> JavaScript, TypeScript, Python, Go</li>
          <li><strong>Frontend:</strong> React, Vue, Three.js, WebGL</li>
          <li><strong>Backend:</strong> Node.js, Express, GraphQL</li>
          <li><strong>Tools:</strong> Git, Docker, AWS, Firebase</li>
        </ul>
      `,
    },
    {
      id: 'projects',
      name: 'Projects Tower',
      type: 'tower',
      position: new THREE.Vector3(0, 0, -25), // North side
      content: `
        <h3>Featured Projects</h3>
        <p>Loading GitHub projects...</p>
      `,
    },
    {
      id: 'music',
      name: 'Vinyl Records',
      type: 'deli',
      position: new THREE.Vector3(-15, 0, 0), // West side
      content: `
        <h3>Music Favorites</h3>
        <p>Loading music content...</p>
      `,
    },
    {
      id: 'contact',
      name: 'Contact Coffee',
      type: 'coffee',
      position: new THREE.Vector3(0, 0, 25), // South side (near spawn)
      content: `
        <h3>Get In Touch</h3>
        <ul>
          <li><strong>Email:</strong> contact@example.com</li>
          <li><strong>GitHub:</strong> @username</li>
          <li><strong>LinkedIn:</strong> /in/username</li>
        </ul>
      `,
    },
  ],

  // Current interaction
  currentBuilding: null,
  isModalOpen: false,

  // Visited buildings tracking
  visitedBuildings: new Set(),

  // Quality settings
  qualityLevel: 'high', // 'low', 'medium', 'high'

  // Actions
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setLoadProgress: (progress) => set({ loadProgress: progress }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setNight: (isNight) => set({ isNight }),
  setCurrentBuilding: (building) => {
    if (building) {
      get().markBuildingVisited(building.id);
    }
    set({ currentBuilding: building });
  },
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, currentBuilding: null }),
  markBuildingVisited: (buildingId) => {
    const visited = get().visitedBuildings;
    visited.add(buildingId);
    set({ visitedBuildings: new Set(visited) });
  },
  setQualityLevel: (level) => set({ qualityLevel: level }),

  // Getters
  getBuildingById: (id) => get().buildings.find((b) => b.id === id),
  isBuildingVisited: (id) => get().visitedBuildings.has(id),
}));

// Export the store with a React-like hook API for compatibility
export const useGameStore = {
  getState: () => store.getState(),
  setState: (partial) => store.setState(partial),
  subscribe: (listener) => store.subscribe(listener),
};
