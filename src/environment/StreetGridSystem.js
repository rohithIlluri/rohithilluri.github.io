/**
 * StreetGridSystem.js - Navigable Street Grid on Spherical Surface
 * Creates a grid of streets using great circle arcs on the tiny planet
 * Returns street boundaries for building placement
 */

import * as THREE from 'three';
import { createToonMaterial } from '../shaders/toon.js';
import { STREET_GRID_COLORS } from '../constants/colors.js';

// Street configuration - widened for better navigation
const STREET_CONFIG = {
  MAIN_WIDTH: 5.0,          // Main street width (units) - wider for spacious feel
  SIDE_WIDTH: 3.5,          // Side street width (units) - still navigable
  ALLEY_WIDTH: 2.0,         // Narrow alley width (units) - wider for accessibility
  GRID_SPACING_LAT: 25,     // Degrees between lat streets - more space between
  GRID_SPACING_LON: 30,     // Degrees between lon streets - more space between
  CURB_HEIGHT: 0.10,        // Curb height above road - more visible
  ROAD_OFFSET: 0.02,        // Road height above planet surface
};

export class StreetGridSystem {
  constructor(planet, scene) {
    this.planet = planet;
    this.scene = scene;
    this.radius = planet.radius;

    // Street segments
    this.streets = [];
    this.streetMeshes = [];

    // Building zones (areas between streets)
    this.buildingZones = [];

    // Materials
    this.mainRoadMat = createToonMaterial({ color: STREET_GRID_COLORS.MAIN_ROAD });
    this.sideRoadMat = createToonMaterial({ color: STREET_GRID_COLORS.SIDE_ROAD });
    this.curbMat = createToonMaterial({ color: STREET_GRID_COLORS.CURB });
    this.markingMat = createToonMaterial({ color: STREET_GRID_COLORS.MARKING_WHITE });
    this.yellowMat = createToonMaterial({ color: STREET_GRID_COLORS.MARKING_YELLOW });
  }

  /**
   * Generate the street grid
   * @param {Object} options - Grid generation options
   */
  generate(options = {}) {
    const {
      latRange = { min: -50, max: 50 },  // Latitude range to cover
      lonRange = { min: -180, max: 180 }, // Full longitude wrap
      mainStreetLats = [0, 25, -25],      // Latitudes for main east-west streets
      mainStreetLons = [0, 45, 90, 135, -45, -90, -135, 180], // Longitudes for main north-south streets
    } = options;

    // Create main east-west streets (latitude lines)
    mainStreetLats.forEach(lat => {
      this.createLatitudeStreet(lat, STREET_CONFIG.MAIN_WIDTH, true);
    });

    // Create main north-south streets (longitude lines / meridians)
    mainStreetLons.forEach(lon => {
      this.createLongitudeStreet(lon, latRange, STREET_CONFIG.MAIN_WIDTH, true);
    });

    // Create side streets between main streets
    this.createSideStreets(latRange, mainStreetLats, mainStreetLons);

    // Calculate building zones (blocks between streets)
    this.calculateBuildingZones(mainStreetLats, mainStreetLons);

    return {
      streets: this.streets,
      buildingZones: this.buildingZones,
    };
  }

  /**
   * Create an east-west street along a latitude line
   */
  createLatitudeStreet(lat, width, isMain = false) {
    const segments = 72; // Segments around the planet
    const material = isMain ? this.mainRoadMat : this.sideRoadMat;

    // Calculate the radius at this latitude
    const latRad = THREE.MathUtils.degToRad(lat);
    const ringRadius = this.radius * Math.cos(latRad);
    const ringY = this.radius * Math.sin(latRad);

    // Street surface (torus ring)
    const streetGeo = new THREE.TorusGeometry(ringRadius, width / 2, 8, segments);
    const street = new THREE.Mesh(streetGeo, material);
    street.position.y = ringY;
    street.rotation.x = Math.PI / 2;
    street.receiveShadow = true;
    this.scene.add(street);
    this.streetMeshes.push(street);

    // Add curbs on both sides
    this.addLatitudeCurbs(lat, width, ringRadius, ringY, segments);

    // Add center line for main streets
    if (isMain) {
      this.addLatitudeCenterLine(lat, ringRadius, ringY);
    }

    // Store street data
    this.streets.push({
      type: 'latitude',
      lat,
      width,
      isMain,
      ringRadius,
      ringY,
    });
  }

  /**
   * Create a north-south street along a longitude line (meridian arc)
   */
  createLongitudeStreet(lon, latRange, width, isMain = false) {
    const material = isMain ? this.mainRoadMat : this.sideRoadMat;
    const lonRad = THREE.MathUtils.degToRad(lon);

    // Create street as a series of connected segments
    const segments = 24;
    const latStep = (latRange.max - latRange.min) / segments;

    for (let i = 0; i < segments; i++) {
      const lat1 = latRange.min + i * latStep;
      const lat2 = latRange.min + (i + 1) * latStep;

      const pos1 = this.planet.latLonToPosition(lat1, lon);
      const pos2 = this.planet.latLonToPosition(lat2, lon);

      // Create a curved segment
      this.createStreetSegment(pos1, pos2, width, material);
    }

    // Store street data
    this.streets.push({
      type: 'longitude',
      lon,
      latRange,
      width,
      isMain,
    });
  }

  /**
   * Create a street segment between two points on the sphere
   */
  createStreetSegment(pos1, pos2, width, material) {
    // Mid-point for orientation
    const midPoint = pos1.clone().add(pos2).multiplyScalar(0.5);
    const surfaceMid = this.planet.projectToSurfaceWithHeight(midPoint, STREET_CONFIG.ROAD_OFFSET);

    // Direction along the street
    const direction = pos2.clone().sub(pos1);
    const length = direction.length();
    direction.normalize();

    // Up vector at midpoint
    const up = this.planet.getUpVector(surfaceMid);

    // Right vector (perpendicular to direction and up)
    const right = new THREE.Vector3().crossVectors(direction, up).normalize();

    // Create street geometry
    const streetGeo = new THREE.BoxGeometry(width, 0.05, length);
    const street = new THREE.Mesh(streetGeo, material);

    // Position at midpoint
    street.position.copy(surfaceMid);

    // Orient to lie on surface
    const orientation = this.planet.getSurfaceOrientation(surfaceMid);
    street.quaternion.copy(orientation);

    // Rotate to align with street direction
    const lookAtPos = surfaceMid.clone().add(direction);
    street.lookAt(lookAtPos);

    // Adjust rotation to lie flat
    street.rotateX(Math.PI / 2);

    street.receiveShadow = true;
    this.scene.add(street);
    this.streetMeshes.push(street);
  }

  /**
   * Add curbs to a latitude street
   */
  addLatitudeCurbs(lat, width, ringRadius, ringY, segments) {
    const curbWidth = 0.15;
    const curbOffset = width / 2 + curbWidth / 2;

    // Outer curb
    const outerCurbGeo = new THREE.TorusGeometry(
      ringRadius + curbOffset,
      curbWidth / 2 + STREET_CONFIG.CURB_HEIGHT / 2,
      4,
      segments
    );
    const outerCurb = new THREE.Mesh(outerCurbGeo, this.curbMat);
    outerCurb.position.y = ringY + STREET_CONFIG.CURB_HEIGHT / 2;
    outerCurb.rotation.x = Math.PI / 2;
    this.scene.add(outerCurb);
    this.streetMeshes.push(outerCurb);

    // Inner curb
    const innerCurbGeo = new THREE.TorusGeometry(
      ringRadius - curbOffset,
      curbWidth / 2 + STREET_CONFIG.CURB_HEIGHT / 2,
      4,
      segments
    );
    const innerCurb = new THREE.Mesh(innerCurbGeo, this.curbMat);
    innerCurb.position.y = ringY + STREET_CONFIG.CURB_HEIGHT / 2;
    innerCurb.rotation.x = Math.PI / 2;
    this.scene.add(innerCurb);
    this.streetMeshes.push(innerCurb);
  }

  /**
   * Add dashed center line to a latitude street
   */
  addLatitudeCenterLine(lat, ringRadius, ringY) {
    const dashCount = 48;
    const dashLength = 0.5;
    const dashWidth = 0.08;

    for (let i = 0; i < dashCount; i++) {
      const angle = (i / dashCount) * Math.PI * 2;

      const dashGeo = new THREE.BoxGeometry(dashWidth, 0.02, dashLength);
      const dash = new THREE.Mesh(dashGeo, this.yellowMat);

      dash.position.x = Math.cos(angle) * ringRadius;
      dash.position.z = Math.sin(angle) * ringRadius;
      dash.position.y = ringY + 0.03;

      dash.rotation.y = -angle + Math.PI / 2;

      this.scene.add(dash);
      this.streetMeshes.push(dash);
    }
  }

  /**
   * Create side streets between main streets
   */
  createSideStreets(latRange, mainLats, mainLons) {
    // Add side streets at half-spacing between main streets
    const sortedLats = [...mainLats].sort((a, b) => a - b);

    for (let i = 0; i < sortedLats.length - 1; i++) {
      const midLat = (sortedLats[i] + sortedLats[i + 1]) / 2;
      // Only add if within range
      if (midLat >= latRange.min && midLat <= latRange.max) {
        this.createLatitudeStreet(midLat, STREET_CONFIG.SIDE_WIDTH, false);
      }
    }

    // Add side meridians between main meridians
    const sortedLons = [...mainLons].sort((a, b) => a - b);

    for (let i = 0; i < sortedLons.length - 1; i++) {
      const midLon = (sortedLons[i] + sortedLons[i + 1]) / 2;
      this.createLongitudeStreet(midLon, latRange, STREET_CONFIG.SIDE_WIDTH, false);
    }
  }

  /**
   * Calculate building zones (blocks between streets)
   */
  calculateBuildingZones(mainLats, mainLons) {
    const sortedLats = [...mainLats].sort((a, b) => a - b);
    const sortedLons = [...mainLons].sort((a, b) => a - b);

    // Add intermediate latitudes for side streets
    const allLats = [];
    for (let i = 0; i < sortedLats.length - 1; i++) {
      allLats.push(sortedLats[i]);
      allLats.push((sortedLats[i] + sortedLats[i + 1]) / 2);
    }
    allLats.push(sortedLats[sortedLats.length - 1]);

    // Add intermediate longitudes for side streets
    const allLons = [];
    for (let i = 0; i < sortedLons.length - 1; i++) {
      allLons.push(sortedLons[i]);
      allLons.push((sortedLons[i] + sortedLons[i + 1]) / 2);
    }
    allLons.push(sortedLons[sortedLons.length - 1]);

    // Create building zones for each block
    for (let i = 0; i < allLats.length - 1; i++) {
      for (let j = 0; j < allLons.length - 1; j++) {
        const zone = {
          latMin: allLats[i],
          latMax: allLats[i + 1],
          lonMin: allLons[j],
          lonMax: allLons[j + 1],
          centerLat: (allLats[i] + allLats[i + 1]) / 2,
          centerLon: (allLons[j] + allLons[j + 1]) / 2,
        };

        // Calculate zone bounds for building placement (inset from streets)
        const streetInset = 2.0; // Units to inset from street edge
        zone.buildableBounds = this.calculateBuildableBounds(zone, streetInset);

        this.buildingZones.push(zone);
      }
    }
  }

  /**
   * Calculate buildable area within a zone (accounting for street widths)
   */
  calculateBuildableBounds(zone, inset) {
    // Convert inset to approximate degrees at this latitude
    const avgLat = (zone.latMin + zone.latMax) / 2;
    const latInset = (inset / this.radius) * (180 / Math.PI);
    const lonInset = latInset / Math.cos(THREE.MathUtils.degToRad(avgLat));

    return {
      latMin: zone.latMin + latInset,
      latMax: zone.latMax - latInset,
      lonMin: zone.lonMin + lonInset,
      lonMax: zone.lonMax - lonInset,
    };
  }

  /**
   * Get street exclusion zones for collision detection
   */
  getStreetBounds() {
    return this.streets.map(street => ({
      type: street.type,
      lat: street.lat,
      lon: street.lon,
      width: street.width,
      latRange: street.latRange,
    }));
  }

  /**
   * Check if a position is on a street
   */
  isOnStreet(position) {
    const { lat, lon } = this.planet.positionToLatLon(position);

    for (const street of this.streets) {
      if (street.type === 'latitude') {
        // Check if within latitude street band
        const latDiff = Math.abs(lat - street.lat);
        const streetHalfWidth = (street.width / this.radius) * (180 / Math.PI) / 2;
        if (latDiff < streetHalfWidth + 1) { // +1 for curb
          return true;
        }
      } else if (street.type === 'longitude') {
        // Check if within longitude street band and in lat range
        if (lat >= street.latRange.min && lat <= street.latRange.max) {
          let lonDiff = Math.abs(lon - street.lon);
          if (lonDiff > 180) lonDiff = 360 - lonDiff;
          const streetHalfWidth = (street.width / this.radius) * (180 / Math.PI) / 2 / Math.cos(THREE.MathUtils.degToRad(lat));
          if (lonDiff < streetHalfWidth + 1) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get building placement positions along a street
   * @param {number} streetLat - Latitude of street to line
   * @param {number} side - 1 for outer side, -1 for inner side
   * @param {number} buildingDepth - Depth of buildings to place
   */
  getBuildingPositionsAlongStreet(streetLat, side, buildingDepth, spacing = 4) {
    const positions = [];
    const street = this.streets.find(s => s.type === 'latitude' && s.lat === streetLat);

    if (!street) return positions;

    // Calculate offset from street center
    const offset = (street.width / 2 + buildingDepth / 2 + 0.5) * side;
    const offsetLat = streetLat + (offset / this.radius) * (180 / Math.PI);

    // Generate positions around the latitude
    const circumference = 2 * Math.PI * this.radius * Math.cos(THREE.MathUtils.degToRad(streetLat));
    const buildingCount = Math.floor(circumference / spacing);

    for (let i = 0; i < buildingCount; i++) {
      const lon = (i / buildingCount) * 360 - 180;
      positions.push({
        lat: offsetLat,
        lon,
        facingStreet: side < 0, // Inner side faces outward
        streetLat,
      });
    }

    return positions;
  }

  /**
   * Dispose of all street meshes
   */
  dispose() {
    this.streetMeshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.scene.remove(mesh);
    });
    this.streetMeshes = [];
    this.streets = [];
    this.buildingZones = [];
  }
}
