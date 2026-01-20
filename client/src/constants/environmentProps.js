/**
 * Environment Props Configuration
 * Positions for trees, benches, signs, and bushes around the planet
 *
 * All props use spherical coordinates:
 * - theta: angle around equator (0 to 2π)
 * - phi: angle from north pole (π/2 = equator)
 */

import { ZONE_COLORS } from './planetTheme';

// Trees - scattered between buildings, avoiding main paths
export const TREES = [
  // Welcome zone
  { id: 'tree-1', theta: 0.15, phi: Math.PI / 2.1, scale: 0.9 },
  { id: 'tree-2', theta: 0.28, phi: Math.PI / 1.9, scale: 1.1 },

  // Skills zone
  { id: 'tree-3', theta: 0.55, phi: Math.PI / 2.05, scale: 1.0 },
  { id: 'tree-4', theta: 0.65, phi: Math.PI / 1.95, scale: 0.85 },

  // Projects zone
  { id: 'tree-5', theta: 0.95, phi: Math.PI / 2.1, scale: 1.15 },

  // Music zone
  { id: 'tree-6', theta: 1.25, phi: Math.PI / 1.9, scale: 1.0 },
  { id: 'tree-7', theta: 1.35, phi: Math.PI / 2.08, scale: 0.9 },

  // Movies zone
  { id: 'tree-8', theta: 1.55, phi: Math.PI / 2.05, scale: 1.05 },

  // Contact zone
  { id: 'tree-9', theta: 1.85, phi: Math.PI / 1.92, scale: 0.95 },
  { id: 'tree-10', theta: 1.95, phi: Math.PI / 2.1, scale: 1.1 },
];

// Benches - near crosswalks and landmarks, facing interesting views
export const BENCHES = [
  // Welcome zone - facing the guide
  { id: 'bench-1', theta: 0.08, phi: Math.PI / 2, rotation: Math.PI * 0.6 },

  // Skills zone - near workshop
  { id: 'bench-2', theta: 0.5, phi: Math.PI / 2, rotation: Math.PI * 0.3 },

  // Projects zone - viewing pavilion
  { id: 'bench-3', theta: 0.85, phi: Math.PI / 2, rotation: -Math.PI * 0.2 },

  // Music zone - listening spot
  { id: 'bench-4', theta: 1.18, phi: Math.PI / 2, rotation: Math.PI * 0.5 },

  // Cinema zone - outside theater
  { id: 'bench-5', theta: 1.48, phi: Math.PI / 2, rotation: Math.PI * 0.1 },

  // Contact zone - contemplation spot
  { id: 'bench-6', theta: 1.88, phi: Math.PI / 2, rotation: -Math.PI * 0.4 },
];

// Signs - at zone borders, pointing to attractions
export const SIGNS = [
  // Welcome to Skills
  {
    id: 'sign-1',
    theta: Math.PI * 0.35,
    phi: Math.PI / 2,
    rotation: Math.PI * 0.5,
    color: ZONE_COLORS.skills.ground,
    arrowColor: ZONE_COLORS.skills.accent,
  },
  // Skills to Projects
  {
    id: 'sign-2',
    theta: Math.PI * 0.7,
    phi: Math.PI / 2,
    rotation: Math.PI * 0.5,
    color: ZONE_COLORS.projects.ground,
    arrowColor: ZONE_COLORS.projects.accent,
  },
  // Projects to Music
  {
    id: 'sign-3',
    theta: Math.PI * 1.05,
    phi: Math.PI / 2,
    rotation: Math.PI * 0.5,
    color: ZONE_COLORS.music.ground,
    arrowColor: ZONE_COLORS.music.accent,
  },
  // Music to Movies
  {
    id: 'sign-4',
    theta: Math.PI * 1.4,
    phi: Math.PI / 2,
    rotation: Math.PI * 0.5,
    color: ZONE_COLORS.movies.ground,
    arrowColor: ZONE_COLORS.movies.accent,
  },
  // Movies to Contact
  {
    id: 'sign-5',
    theta: Math.PI * 1.75,
    phi: Math.PI / 2,
    rotation: Math.PI * 0.5,
    color: ZONE_COLORS.contact.ground,
    arrowColor: ZONE_COLORS.contact.accent,
  },
];

// Bushes - building perimeters, decorative clusters
export const BUSHES = [
  // Welcome zone
  { id: 'bush-1', theta: 0.05, phi: Math.PI / 2, scale: 0.8, color: '#388E3C' },
  { id: 'bush-2', theta: 0.22, phi: Math.PI / 2.05, scale: 0.7, color: '#43A047' },

  // Skills zone
  { id: 'bush-3', theta: 0.42, phi: Math.PI / 2, scale: 0.9, color: '#2E7D32' },
  { id: 'bush-4', theta: 0.6, phi: Math.PI / 1.95, scale: 0.75, color: '#388E3C' },

  // Projects zone
  { id: 'bush-5', theta: 0.8, phi: Math.PI / 2.03, scale: 0.85, color: '#43A047' },

  // Music zone
  { id: 'bush-6', theta: 1.15, phi: Math.PI / 2, scale: 0.9, color: '#2E7D32' },

  // Movies zone
  { id: 'bush-7', theta: 1.52, phi: Math.PI / 2.02, scale: 0.8, color: '#388E3C' },

  // Contact zone
  { id: 'bush-8', theta: 1.78, phi: Math.PI / 2, scale: 0.85, color: '#43A047' },
];

// Export all props together
export const ENVIRONMENT_PROPS = {
  trees: TREES,
  benches: BENCHES,
  signs: SIGNS,
  bushes: BUSHES,
};

export default ENVIRONMENT_PROPS;
