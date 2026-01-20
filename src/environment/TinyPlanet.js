/**
 * TinyPlanet.js - Spherical World System
 * Creates a tiny planet surface for the messenger.abeto.co style experience
 * Objects are placed on the sphere surface, always oriented "outward" from center
 */

import * as THREE from 'three';

export class TinyPlanet {
  constructor(radius = 50) {
    this.radius = radius;
    this.center = new THREE.Vector3(0, 0, 0);

    // Zones on the planet (defined by latitude/longitude regions)
    this.zones = {
      town: { latMin: -30, latMax: 30, lonMin: -45, lonMax: 45 },       // Front/center
      forest: { latMin: -30, latMax: 30, lonMin: 135, lonMax: -135 },   // Back
      beach: { latMin: -30, latMax: 30, lonMin: 45, lonMax: 135 },      // Right side
      mountain: { latMin: 30, latMax: 90, lonMin: -180, lonMax: 180 },  // North pole
      harbor: { latMin: -90, latMax: -30, lonMin: -180, lonMax: 180 },  // South pole
    };
  }

  /**
   * Get the "up" vector at a given position on the sphere
   * This is the direction pointing away from the planet center
   * @param {THREE.Vector3} position Position on or near the sphere
   * @returns {THREE.Vector3} Normalized up vector
   */
  getUpVector(position) {
    return position.clone().sub(this.center).normalize();
  }

  /**
   * Get the local tangent vectors at a position (for movement)
   * Returns forward and right vectors that lie on the sphere surface
   * @param {THREE.Vector3} position Position on sphere
   * @param {number} heading Player's heading angle in radians
   * @returns {Object} { forward: Vector3, right: Vector3, up: Vector3 }
   */
  getLocalAxes(position, heading = 0) {
    const up = this.getUpVector(position);

    // Create initial forward direction (tangent to sphere)
    // Start with a "north" reference, then adjust for poles
    let referenceForward = new THREE.Vector3(0, 1, 0);

    // If we're near the poles, use a different reference
    if (Math.abs(up.y) > 0.9) {
      referenceForward = new THREE.Vector3(0, 0, 1);
    }

    // Right is perpendicular to up and reference
    const right = new THREE.Vector3().crossVectors(up, referenceForward).normalize();

    // Forward is perpendicular to up and right
    const forward = new THREE.Vector3().crossVectors(right, up).normalize();

    // Rotate forward and right by the heading angle around up axis
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(up, heading);
    forward.applyMatrix4(rotationMatrix);
    right.applyMatrix4(rotationMatrix);

    return { forward, right, up };
  }

  /**
   * Project a position onto the sphere surface
   * @param {THREE.Vector3} position Any position in 3D space
   * @returns {THREE.Vector3} Position projected onto sphere surface
   */
  projectToSurface(position) {
    const direction = position.clone().sub(this.center).normalize();
    return this.center.clone().add(direction.multiplyScalar(this.radius));
  }

  /**
   * Project a position onto the sphere surface at a given height above it
   * @param {THREE.Vector3} position Any position in 3D space
   * @param {number} height Height above the sphere surface
   * @returns {THREE.Vector3} Position at the given height above the sphere
   */
  projectToSurfaceWithHeight(position, height = 0) {
    const direction = position.clone().sub(this.center).normalize();
    return this.center.clone().add(direction.multiplyScalar(this.radius + height));
  }

  /**
   * Convert spherical coordinates (latitude, longitude) to position on sphere
   * @param {number} lat Latitude in degrees (-90 to 90)
   * @param {number} lon Longitude in degrees (-180 to 180)
   * @returns {THREE.Vector3} Position on sphere surface
   */
  latLonToPosition(lat, lon) {
    const phi = THREE.MathUtils.degToRad(90 - lat);   // Polar angle from top
    const theta = THREE.MathUtils.degToRad(lon);      // Azimuthal angle

    return new THREE.Vector3(
      this.radius * Math.sin(phi) * Math.sin(theta),
      this.radius * Math.cos(phi),
      this.radius * Math.sin(phi) * Math.cos(theta)
    );
  }

  /**
   * Convert a position to latitude/longitude
   * @param {THREE.Vector3} position Position on or near sphere
   * @returns {Object} { lat: number, lon: number } in degrees
   */
  positionToLatLon(position) {
    const normalized = position.clone().sub(this.center).normalize();
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(normalized.y));
    const lon = THREE.MathUtils.radToDeg(Math.atan2(normalized.x, normalized.z));
    return { lat, lon };
  }

  /**
   * Get the zone at a given position
   * @param {THREE.Vector3} position Position on sphere
   * @returns {string|null} Zone name or null if not in any zone
   */
  getZoneAt(position) {
    const { lat, lon } = this.positionToLatLon(position);

    for (const [zoneName, bounds] of Object.entries(this.zones)) {
      if (lat >= bounds.latMin && lat <= bounds.latMax) {
        // Handle longitude wrap-around for zones that cross the -180/180 line
        if (bounds.lonMin > bounds.lonMax) {
          // Zone crosses the date line
          if (lon >= bounds.lonMin || lon <= bounds.lonMax) {
            return zoneName;
          }
        } else {
          if (lon >= bounds.lonMin && lon <= bounds.lonMax) {
            return zoneName;
          }
        }
      }
    }
    return null;
  }

  /**
   * Create a quaternion that orients an object to stand on the sphere surface
   * Object's local Y-axis will point away from planet center
   * @param {THREE.Vector3} position Position on sphere surface
   * @param {number} heading Optional heading rotation (radians)
   * @returns {THREE.Quaternion} Orientation quaternion
   */
  getSurfaceOrientation(position, heading = 0) {
    const up = this.getUpVector(position);

    // Create rotation from default up (0,1,0) to surface up
    const defaultUp = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();

    // If up is already (0,1,0), no rotation needed for vertical alignment
    if (up.distanceTo(defaultUp) > 0.001) {
      quaternion.setFromUnitVectors(defaultUp, up);
    }

    // Apply heading rotation around the local up axis
    if (heading !== 0) {
      const headingQuat = new THREE.Quaternion().setFromAxisAngle(up, heading);
      quaternion.premultiply(headingQuat);
    }

    return quaternion;
  }

  /**
   * Move a position on the sphere surface by angular displacement
   * @param {THREE.Vector3} currentPos Current position on sphere
   * @param {THREE.Vector3} moveDirection Direction to move (in local tangent space)
   * @param {number} distance Distance to move (arc length)
   * @returns {THREE.Vector3} New position on sphere
   */
  moveOnSurface(currentPos, moveDirection, distance) {
    // Convert linear distance to angular displacement
    const angularDisplacement = distance / this.radius;

    // Get the axis of rotation (perpendicular to both up and move direction)
    const up = this.getUpVector(currentPos);
    const axis = new THREE.Vector3().crossVectors(up, moveDirection).normalize();

    // If axis is zero (moving directly up/down), just return current position
    if (axis.length() < 0.001) {
      return currentPos.clone();
    }

    // Rotate position around the axis
    const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angularDisplacement);
    const newPos = currentPos.clone().sub(this.center);
    newPos.applyQuaternion(rotation);
    newPos.add(this.center);

    // Project back to sphere surface (to handle floating point errors)
    return this.projectToSurface(newPos);
  }

  /**
   * Calculate the arc distance between two points on the sphere
   * @param {THREE.Vector3} posA First position
   * @param {THREE.Vector3} posB Second position
   * @returns {number} Arc distance
   */
  getArcDistance(posA, posB) {
    const dirA = posA.clone().sub(this.center).normalize();
    const dirB = posB.clone().sub(this.center).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(dirA.dot(dirB), -1, 1));
    return angle * this.radius;
  }

  /**
   * Check if a position is "above" the sphere surface
   * @param {THREE.Vector3} position Position to check
   * @param {number} tolerance Height tolerance
   * @returns {boolean} True if above surface
   */
  isAboveSurface(position, tolerance = 0.1) {
    const distance = position.distanceTo(this.center);
    return distance > this.radius + tolerance;
  }

  /**
   * Get gravity direction at a position (toward planet center)
   * @param {THREE.Vector3} position Position in space
   * @returns {THREE.Vector3} Gravity direction (normalized)
   */
  getGravityDirection(position) {
    return this.center.clone().sub(position).normalize();
  }
}
