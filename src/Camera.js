/**
 * Camera.js - Third-Person Camera Controller (Planet-Aware)
 * Follows the player with smooth interpolation and collision avoidance
 * Supports both flat worlds and spherical tiny planets
 */

import * as THREE from 'three';

export class Camera {
  constructor(player, collisionMeshes = [], planet = null) {
    this.player = player;
    this.collisionMeshes = collisionMeshes;
    this.planet = planet; // TinyPlanet instance (null for flat world)

    // Camera settings
    this.distance = 8; // Distance from player
    this.height = 4; // Height above player (in local "up" direction)
    this.angle = 0; // Current rotation angle (follows player)

    // Smoothness values (consistent across all lerps for smooth movement)
    // Lower values = smoother/slower transitions
    this.positionSmoothness = 0.08; // Position interpolation (~12-frame smooth transition)
    this.lookAtSmoothness = 0.10; // Look-at interpolation
    this.upVectorSmoothness = 0.10; // Up vector/orientation interpolation

    // Look at offset (slightly above player in local up direction)
    this.lookAtOffset = new THREE.Vector3(0, 1.5, 0);

    // Collision avoidance
    this.raycaster = new THREE.Raycaster();
    this.minDistance = 2;

    // Three.js camera
    this.camera = null;

    // Current camera state
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // For smooth quaternion interpolation on sphere
    this.currentOrientation = new THREE.Quaternion();
    this.targetOrientation = new THREE.Quaternion();
  }

  /**
   * Set the planet for spherical camera behavior
   * @param {TinyPlanet} planet
   */
  setPlanet(planet) {
    this.planet = planet;
  }

  init() {
    // Create perspective camera
    this.camera = new THREE.PerspectiveCamera(
      55, // FOV - slightly narrower for better framing on tiny planet
      window.innerWidth / window.innerHeight, // Aspect
      0.1, // Near
      1000 // Far
    );

    // Initial position behind player
    const playerPos = this.player.getPosition();
    const playerRot = this.player.getRotation();

    // Initialize camera position based on world mode
    if (this.planet) {
      this.initSphericalPosition(playerPos, playerRot);
    } else {
      // For initialization, use instant positioning (deltaTime = 1 simulates immediate snap)
      this.updateCameraPositionFlat(1, playerPos, playerRot);
    }

    this.currentPosition.copy(this.camera.position);
    this.currentLookAt.copy(playerPos).add(this.lookAtOffset);
  }

  /**
   * Initialize camera position for spherical planet
   */
  initSphericalPosition(playerPos, playerRot) {
    const up = this.planet.getUpVector(playerPos);
    const axes = this.planet.getLocalAxes(playerPos, playerRot);

    const behindOffset = axes.forward.clone().multiplyScalar(-this.distance);
    const aboveOffset = up.clone().multiplyScalar(this.height);

    const playerSurfacePos = this.planet.projectToSurface(playerPos);

    this.camera.position.copy(playerSurfacePos)
      .add(behindOffset)
      .add(aboveOffset);

    const lookAtOffsetWorld = up.clone().multiplyScalar(this.lookAtOffset.y);
    const targetLookAt = playerSurfacePos.clone().add(lookAtOffsetWorld);
    this.camera.lookAt(targetLookAt);

    this.camera.up.copy(up);
  }

  update(deltaTime) {
    if (!this.player || !this.camera) return;

    const playerPos = this.player.getPosition();
    const playerRot = this.player.getRotation();

    // Use spherical camera if planet exists
    if (this.planet) {
      this.updateSpherical(deltaTime, playerPos, playerRot);
    } else {
      this.updateFlat(deltaTime, playerPos, playerRot);
    }
  }

  /**
   * Update camera on spherical planet
   */
  updateSpherical(deltaTime, playerPos, playerRot) {
    // Get local axes at player position
    const up = this.planet.getUpVector(playerPos);
    const axes = this.planet.getLocalAxes(playerPos, playerRot);

    // Calculate camera position behind and above player in local space
    // Behind = opposite of player's forward direction
    const behindOffset = axes.forward.clone().multiplyScalar(-this.distance);
    const aboveOffset = up.clone().multiplyScalar(this.height);

    // Get player's surface position
    const playerSurfacePos = this.planet.projectToSurface(playerPos);

    // Calculate ideal camera position
    const idealPosition = playerSurfacePos.clone()
      .add(behindOffset)
      .add(aboveOffset);

    // Check collision and adjust
    const adjustedPosition = this.checkCollisionSpherical(playerSurfacePos, idealPosition, up);

    // Frame-rate independent interpolation factors
    // Formula: 1 - (1 - smoothness)^(deltaTime * 60) ensures consistent feel at any FPS
    const positionLerpFactor = 1 - Math.pow(1 - this.positionSmoothness, deltaTime * 60);
    const lookAtLerpFactor = 1 - Math.pow(1 - this.lookAtSmoothness, deltaTime * 60);
    const upVectorLerpFactor = 1 - Math.pow(1 - this.upVectorSmoothness, deltaTime * 60);

    // Smoothly interpolate camera position
    this.currentPosition.lerp(adjustedPosition, positionLerpFactor);
    this.camera.position.copy(this.currentPosition);

    // Calculate look-at target (player + offset in local up direction)
    const lookAtOffsetWorld = up.clone().multiplyScalar(this.lookAtOffset.y);
    const targetLookAt = playerSurfacePos.clone().add(lookAtOffsetWorld);

    // Smoothly interpolate look-at
    this.currentLookAt.lerp(targetLookAt, lookAtLerpFactor);

    // Make camera look at target
    this.camera.lookAt(this.currentLookAt);

    // Ensure camera's "up" is aligned with planet's up at camera position
    // This prevents disorienting rolls when moving around the planet
    const cameraUp = this.planet.getUpVector(this.camera.position);
    this.camera.up.lerp(cameraUp, upVectorLerpFactor);
  }

  /**
   * Update camera on flat surface (legacy)
   */
  updateFlat(deltaTime, playerPos, playerRot) {
    // Calculate target camera position
    this.updateCameraPositionFlat(deltaTime, playerPos, playerRot);

    // Frame-rate independent look-at interpolation
    const lookAtLerpFactor = 1 - Math.pow(1 - this.lookAtSmoothness, deltaTime * 60);

    // Update look at
    const targetLookAt = playerPos.clone().add(this.lookAtOffset);
    this.currentLookAt.lerp(targetLookAt, lookAtLerpFactor);

    this.camera.lookAt(this.currentLookAt);
  }

  updateCameraPositionFlat(deltaTime, playerPos, playerRot) {
    // Calculate ideal camera position behind player
    const idealOffset = new THREE.Vector3(
      -Math.sin(playerRot) * this.distance,
      this.height,
      -Math.cos(playerRot) * this.distance
    );

    const idealPosition = playerPos.clone().add(idealOffset);

    // Check for collision between player and ideal camera position
    const adjustedPosition = this.checkCollision(playerPos, idealPosition);

    // Frame-rate independent position interpolation
    const positionLerpFactor = 1 - Math.pow(1 - this.positionSmoothness, deltaTime * 60);

    // Smoothly interpolate to target position
    this.currentPosition.lerp(adjustedPosition, positionLerpFactor);
    this.camera.position.copy(this.currentPosition);
  }

  /**
   * Check collision for spherical camera movement
   */
  checkCollisionSpherical(playerPos, targetPos, up) {
    if (this.collisionMeshes.length === 0) {
      return targetPos;
    }

    // Offset the start position slightly above the surface
    const startPos = playerPos.clone().add(up.clone().multiplyScalar(this.lookAtOffset.y));

    const direction = targetPos.clone().sub(startPos).normalize();
    const distance = startPos.distanceTo(targetPos);

    this.raycaster.set(startPos, direction);
    this.raycaster.far = distance;

    const intersects = this.raycaster.intersectObjects(this.collisionMeshes, true);

    if (intersects.length > 0) {
      // Move camera to just before the collision point
      const hitDistance = Math.max(intersects[0].distance - 0.5, this.minDistance);
      return startPos.clone().add(direction.multiplyScalar(hitDistance));
    }

    return targetPos;
  }

  checkCollision(playerPos, targetPos) {
    if (this.collisionMeshes.length === 0) {
      return targetPos;
    }

    const direction = targetPos.clone().sub(playerPos).normalize();
    const distance = playerPos.distanceTo(targetPos);

    this.raycaster.set(
      playerPos.clone().add(this.lookAtOffset),
      direction
    );
    this.raycaster.far = distance;

    const intersects = this.raycaster.intersectObjects(
      this.collisionMeshes,
      true
    );

    if (intersects.length > 0) {
      // Move camera to just before the collision point
      const hitDistance = Math.max(
        intersects[0].distance - 0.5,
        this.minDistance
      );
      return playerPos
        .clone()
        .add(this.lookAtOffset)
        .add(direction.multiplyScalar(hitDistance));
    }

    return targetPos;
  }

  onResize(width, height) {
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  setDistance(distance) {
    this.distance = distance;
  }

  setHeight(height) {
    this.height = height;
  }

  getCamera() {
    return this.camera;
  }

  dispose() {
    // Camera doesn't need disposal, but included for consistency
    this.camera = null;
  }
}
