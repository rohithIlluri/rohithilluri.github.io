/**
 * Planet.js - Spherical Planet Environment
 * Creates the tiny planet with buildings, props, and zones
 * Objects are placed on the sphere surface, oriented outward from center
 */

import * as THREE from 'three';
import { TinyPlanet } from './TinyPlanet.js';
import {
  createToonMaterial,
  createEnhancedToonMaterial,
  createGlowMaterial,
  createOutlineMesh,
  TOON_CONSTANTS,
} from '../shaders/toon.js';

// Neon sign colors
const NEON_COLORS = {
  pink: 0xFF1493,
  blue: 0x00BFFF,
  green: 0x00FF7F,
  yellow: 0xFFD54F,
  orange: 0xFF6B35,
  purple: 0x9B59B6,
  red: 0xFF3333,
};

// Planet color palette (messenger.abeto.co style)
const PLANET_COLORS = {
  grass: 0x7CB342,      // Vibrant green
  grassDark: 0x558B2F,  // Darker grass accent
  sand: 0xFFD54F,       // Beach sand
  rock: 0x757575,       // Mountain rock
  snow: 0xFAFAFA,       // Snow cap
  water: 0x4FC3F7,      // Shallow water
  path: 0xBCAAA4,       // Walkway
};

export class Planet {
  constructor(scene, radius = 50) {
    this.scene = scene;
    this.radius = radius;

    // Create the TinyPlanet system
    this.planet = new TinyPlanet(radius);

    // Collections
    this.meshes = [];
    this.collisionMeshes = [];
    this.lights = [];
    this.buildings = [];
    this.neonSigns = [];
    this.windowMeshes = [];
    this.props = [];

    // Time of day (0 = day, 1 = night)
    this.timeOfDay = 0;

    // Light direction for enhanced materials
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();
  }

  /**
   * Get the TinyPlanet instance for use by player/camera
   */
  getPlanet() {
    return this.planet;
  }

  async init() {
    this.createPlanetSphere();
    this.createPortfolioBuildings();
    this.createProps();
  }

  /**
   * Set light direction for enhanced toon materials
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  /**
   * Create the planet sphere with zones
   */
  createPlanetSphere() {
    // Main planet sphere (grass base)
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    const material = createToonMaterial({
      color: PLANET_COLORS.grass,
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.receiveShadow = true;
    this.scene.add(planetMesh);
    this.meshes.push(planetMesh);

    // Create an outline for the planet
    const outlineMesh = createOutlineMesh(planetMesh, 0.1);
    this.scene.add(outlineMesh);
    this.meshes.push(outlineMesh);

    // Add zone accents (paths, colored areas)
    this.createZoneAccents();
  }

  /**
   * Create visual accents for different zones
   */
  createZoneAccents() {
    // Create path rings around the planet
    this.createPathRing(0, 2);    // Equator path
    this.createPathRing(30, 1.5); // Northern path
    this.createPathRing(-30, 1.5); // Southern path
  }

  /**
   * Create a path ring at given latitude
   */
  createPathRing(latitude, width) {
    const pathGeometry = new THREE.TorusGeometry(
      this.radius * Math.cos(THREE.MathUtils.degToRad(latitude)),
      width / 2,
      8,
      64
    );
    const pathMaterial = createToonMaterial({ color: PLANET_COLORS.path });

    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.position.y = this.radius * Math.sin(THREE.MathUtils.degToRad(latitude));
    path.rotation.x = Math.PI / 2;
    path.receiveShadow = true;
    this.scene.add(path);
    this.meshes.push(path);
  }

  /**
   * Create portfolio buildings on the planet surface
   */
  createPortfolioBuildings() {
    // Skills Building - Forest Grove (West)
    this.createBuilding({
      lat: 0,
      lon: 90,
      name: 'Skills Library',
      type: 'tower',
      color: 0x8B4513,
      neonColor: NEON_COLORS.blue,
      width: 6,
      height: 10,
      depth: 6,
    });

    // Projects Building - Mountain Peak (North)
    this.createBuilding({
      lat: 45,
      lon: 0,
      name: 'Projects Tower',
      type: 'tower',
      color: 0x4A4A4A,
      neonColor: NEON_COLORS.pink,
      width: 8,
      height: 15,
      depth: 8,
    });

    // Music Shop - Beach (East)
    this.createBuilding({
      lat: 0,
      lon: -90,
      name: 'Vinyl Records',
      type: 'shop',
      color: 0xB22222,
      neonColor: NEON_COLORS.green,
      width: 5,
      height: 5,
      depth: 5,
    });

    // Contact Building - Harbor (South)
    this.createBuilding({
      lat: -45,
      lon: 0,
      name: 'Contact Cafe',
      type: 'shop',
      color: 0x8B4513,
      neonColor: NEON_COLORS.orange,
      width: 5,
      height: 4,
      depth: 5,
    });
  }

  /**
   * Create a building at the specified latitude/longitude on the planet
   */
  createBuilding(config) {
    const { lat, lon, name, type, color, neonColor, width, height, depth } = config;

    // Get position on planet surface
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);

    // Create building geometry
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = createEnhancedToonMaterial({
      color: color,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    const building = new THREE.Mesh(geometry, material);

    // Position building on surface (offset by half height so it sits on surface)
    const buildingPos = surfacePos.clone().add(up.clone().multiplyScalar(height / 2));
    building.position.copy(buildingPos);

    // Orient building to stand on sphere surface
    const orientation = this.planet.getSurfaceOrientation(surfacePos);
    building.quaternion.copy(orientation);

    building.castShadow = true;
    building.receiveShadow = true;

    this.scene.add(building);
    this.meshes.push(building);
    this.collisionMeshes.push(building);

    // Create outline for the building
    const outline = createOutlineMesh(building, 0.06);
    outline.position.copy(building.position);
    outline.quaternion.copy(building.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    // Add windows
    this.addWindowsToBuilding(building, width, height, depth, surfacePos, up);

    // Add neon sign
    this.addNeonSignToBuilding(building, name, neonColor, height, depth, surfacePos, up);

    // Store building reference
    this.buildings.push({
      mesh: building,
      name,
      type,
      surfacePosition: surfacePos.clone(),
      lat,
      lon,
    });
  }

  /**
   * Add windows to a building oriented on the sphere
   */
  addWindowsToBuilding(building, width, height, depth, surfacePos, up) {
    const windowMaterial = createToonMaterial({ color: 0x87CEEB });

    const windowSize = 1.0;
    const windowGap = 0.6;
    const windowsPerRow = Math.floor((width - 1) / (windowSize + windowGap));
    const windowRows = Math.floor((height - 2) / (windowSize + windowGap));

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const windowGeom = new THREE.PlaneGeometry(windowSize, windowSize);
        const windowMesh = new THREE.Mesh(windowGeom, windowMaterial.clone());

        // Position relative to building
        const localX = (col - (windowsPerRow - 1) / 2) * (windowSize + windowGap);
        const localY = height / 2 - 1 - row * (windowSize + windowGap);
        const localZ = depth / 2 + 0.01;

        // Transform to building's coordinate system
        windowMesh.position.set(localX, localY, localZ);

        // Add as child of building so it inherits orientation
        building.add(windowMesh);
        this.windowMeshes.push(windowMesh);
      }
    }
  }

  /**
   * Add neon sign to building
   */
  addNeonSignToBuilding(building, name, neonColor, height, depth, surfacePos, up) {
    // Sign background
    const bgGeom = new THREE.BoxGeometry(4, 0.8, 0.1);
    const bgMaterial = createToonMaterial({ color: 0x1A1A2E });
    const signBg = new THREE.Mesh(bgGeom, bgMaterial);

    // Position on front of building
    signBg.position.set(0, height / 2 - 1, depth / 2 + 0.06);
    building.add(signBg);
    this.meshes.push(signBg);

    // Neon glow
    const neonGeom = new THREE.BoxGeometry(3.5, 0.6, 0.05);
    const neonMaterial = new THREE.MeshBasicMaterial({
      color: neonColor,
      transparent: true,
      opacity: 0.9,
    });
    const neonMesh = new THREE.Mesh(neonGeom, neonMaterial);
    neonMesh.position.set(0, 0, 0.06);
    signBg.add(neonMesh);

    this.neonSigns.push({ mesh: neonMesh, color: neonColor, type: 'sign' });

    // Add point light for glow
    const pointLight = new THREE.PointLight(neonColor, 0.5, 10);
    pointLight.position.set(0, 0, 0.5);
    signBg.add(pointLight);
    this.lights.push({ light: pointLight, mesh: neonMesh, color: neonColor, type: 'neon' });
  }

  /**
   * Create props (trees, benches, etc.) on the planet
   */
  createProps() {
    // Create trees around the planet
    const treePositions = [
      { lat: 10, lon: 45 },
      { lat: -10, lon: 45 },
      { lat: 20, lon: -45 },
      { lat: -20, lon: -45 },
      { lat: 15, lon: 135 },
      { lat: -15, lon: 135 },
      { lat: 10, lon: -135 },
      { lat: -10, lon: -135 },
    ];

    treePositions.forEach((pos) => {
      this.createTree(pos.lat, pos.lon);
    });

    // Create benches
    const benchPositions = [
      { lat: 5, lon: 30 },
      { lat: -5, lon: -30 },
    ];

    benchPositions.forEach((pos) => {
      this.createBench(pos.lat, pos.lon);
    });

    // Create street lights
    const lightPositions = [
      { lat: 0, lon: 45 },
      { lat: 0, lon: -45 },
      { lat: 0, lon: 135 },
      { lat: 0, lon: -135 },
    ];

    lightPositions.forEach((pos) => {
      this.createStreetLight(pos.lat, pos.lon);
    });
  }

  /**
   * Create a tree at the specified position
   */
  createTree(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Tree trunk
    const trunkGeom = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = createToonMaterial({ color: 0x5D4037 });
    const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);

    const trunkPos = surfacePos.clone().add(up.clone().multiplyScalar(1));
    trunk.position.copy(trunkPos);
    trunk.quaternion.copy(orientation);
    trunk.castShadow = true;

    this.scene.add(trunk);
    this.meshes.push(trunk);
    this.collisionMeshes.push(trunk);

    // Tree foliage (cone shape)
    const foliageGeom = new THREE.ConeGeometry(1.5, 3, 8);
    const foliageMaterial = createToonMaterial({ color: 0x388E3C });
    const foliage = new THREE.Mesh(foliageGeom, foliageMaterial);

    const foliagePos = surfacePos.clone().add(up.clone().multiplyScalar(3.5));
    foliage.position.copy(foliagePos);
    foliage.quaternion.copy(orientation);
    foliage.castShadow = true;

    this.scene.add(foliage);
    this.meshes.push(foliage);

    // Outline for foliage
    const foliageOutline = createOutlineMesh(foliage, 0.04);
    foliageOutline.position.copy(foliage.position);
    foliageOutline.quaternion.copy(foliage.quaternion);
    this.scene.add(foliageOutline);
    this.meshes.push(foliageOutline);

    this.props.push({ mesh: trunk, type: 'tree', lat, lon });
  }

  /**
   * Create a bench at the specified position
   */
  createBench(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Bench seat
    const seatGeom = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const woodMaterial = createToonMaterial({ color: 0x8B4513 });
    const seat = new THREE.Mesh(seatGeom, woodMaterial);

    const seatPos = surfacePos.clone().add(up.clone().multiplyScalar(0.5));
    seat.position.copy(seatPos);
    seat.quaternion.copy(orientation);
    seat.castShadow = true;

    this.scene.add(seat);
    this.meshes.push(seat);
    this.collisionMeshes.push(seat);

    // Bench back
    const backGeom = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const back = new THREE.Mesh(backGeom, woodMaterial);
    back.position.set(0, 0.3, 0.2);
    seat.add(back);

    this.props.push({ mesh: seat, type: 'bench', lat, lon });
  }

  /**
   * Create a street light at the specified position
   */
  createStreetLight(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Light pole
    const poleGeom = new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
    const poleMaterial = createToonMaterial({ color: 0x2A2A2A });
    const pole = new THREE.Mesh(poleGeom, poleMaterial);

    const polePos = surfacePos.clone().add(up.clone().multiplyScalar(2));
    pole.position.copy(polePos);
    pole.quaternion.copy(orientation);
    pole.castShadow = true;

    this.scene.add(pole);
    this.meshes.push(pole);

    // Light fixture
    const fixtureGeom = new THREE.BoxGeometry(0.5, 0.2, 0.3);
    const fixture = new THREE.Mesh(fixtureGeom, poleMaterial);
    fixture.position.set(0, 2.1, 0);
    pole.add(fixture);

    // Light bulb (glows at night)
    const bulbMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFE4B5,
      transparent: true,
      opacity: 0,
    });
    const bulbGeom = new THREE.SphereGeometry(0.1, 8, 8);
    const bulb = new THREE.Mesh(bulbGeom, bulbMaterial);
    bulb.position.set(0, -0.15, 0);
    fixture.add(bulb);

    // Point light
    const pointLight = new THREE.PointLight(0xFFE4B5, 0, 12);
    pointLight.position.set(0, -0.15, 0);
    fixture.add(pointLight);

    this.lights.push({ light: pointLight, mesh: bulb, type: 'streetlight' });
    this.props.push({ mesh: pole, type: 'streetlight', lat, lon });
  }

  /**
   * Set time of day and update lighting
   */
  setTimeOfDay(time) {
    this.timeOfDay = time;

    // Update street lights
    this.lights.forEach(({ light, mesh, type }) => {
      if (type === 'streetlight' && light) {
        light.intensity = time * 2;
        if (mesh && mesh.material) {
          mesh.material.opacity = time;
        }
      } else if (type === 'neon' && light) {
        light.intensity = 0.5 + time * 1.5;
      }
    });

    // Update neon signs
    this.neonSigns.forEach(({ mesh }) => {
      if (mesh && mesh.material) {
        mesh.material.opacity = 0.7 + time * 0.3;
      }
    });

    // Update windows
    this.windowMeshes.forEach((mesh) => {
      if (mesh.material && mesh.material.transparent) {
        mesh.material.opacity = time * 0.6;
      }
    });
  }

  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  update(deltaTime) {
    // Animate any props that need it
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.scene.remove(mesh);
    });

    this.lights.forEach(({ light }) => {
      if (light && light.parent) {
        light.parent.remove(light);
      }
    });

    this.meshes = [];
    this.collisionMeshes = [];
    this.lights = [];
    this.buildings = [];
    this.neonSigns = [];
    this.windowMeshes = [];
    this.props = [];
  }
}
