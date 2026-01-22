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
  createThickOutlineMesh,
  TOON_CONSTANTS,
} from '../shaders/toon.js';

// Neon sign colors (softened for dreamy messenger-like feel)
const NEON_COLORS = {
  pink: 0xE87AA4,    // Muted from 0xFF1493
  blue: 0x7EC8E3,    // Muted from 0x00BFFF
  green: 0x7FD1A6,   // Muted from 0x00FF7F
  yellow: 0xE8D178,  // Softened from 0xFFD54F
  orange: 0xE8A87C,  // Muted from 0xFF6B35
  purple: 0x9B89B3,  // Muted from 0x9B59B6
  red: 0xE88B8B,     // Muted from 0xFF3333
};

// Building color palette (messenger.abeto.co style)
const BUILDING_COLORS = {
  cream: 0xE8DFD0,     // Most common - warm cream
  warmGray: 0xB8AFA0,  // Warm gray
  coolGray: 0x8A9090,  // Cool gray
  mint: 0x8ECAC6,      // Mint/teal accent
  coral: 0xE8A8A0,     // Coral/peach accent
};

// Awning colors for storefronts
const AWNING_COLORS = [
  0xC44536, // Red
  0x2A9D8F, // Teal
  0xE9C46A, // Yellow/gold
  0x264653, // Dark teal
  0xE76F51, // Orange/coral
];

// Sign border colors (Japanese style)
const SIGN_BORDER_COLORS = [
  0xC44536, // Red
  0x2A9D8F, // Teal
  0xE9C46A, // Yellow
];

// NYC prop colors
const NYC_COLORS = {
  taxi: 0xF7B731,        // Yellow taxi
  hydrant: 0xFF3333,     // Red fire hydrant
  mailbox: 0x004A9C,     // USPS blue
  subway: 0x0B7A41,      // Subway green
  trashCan: 0x2D5A27,    // Dark green trash can
  streetSign: 0x006400,  // Street sign green
  hotDogCart: 0xB22222,  // Hot dog cart red
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
    this.createPowerLines(); // Connect street lights with power lines
    this.createBushesNearBuildings(); // Add vegetation near buildings
    this.createGroundScatter();
  }

  /**
   * Create bushes/shrubs near buildings for more natural environment
   */
  createBushesNearBuildings() {
    const bushMaterial = createToonMaterial({ color: 0x2E7D32 }); // Dark green
    const bushMaterialLight = createToonMaterial({ color: 0x4CAF50 }); // Lighter green

    // Building positions with offsets for bushes
    const buildingBushes = [
      // Skills Building (West) - lon 90
      { lat: 3, lon: 85 }, { lat: -3, lon: 85 },
      { lat: 5, lon: 95 }, { lat: -5, lon: 95 },
      // Projects Building (North) - lat 45, lon 0
      { lat: 42, lon: 5 }, { lat: 42, lon: -5 },
      { lat: 48, lon: 3 }, { lat: 48, lon: -3 },
      // Music Shop (East) - lon -90
      { lat: 3, lon: -85 }, { lat: -3, lon: -85 },
      { lat: 2, lon: -95 }, { lat: -2, lon: -95 },
      // Contact Cafe (South) - lat -45, lon 0
      { lat: -42, lon: 5 }, { lat: -42, lon: -5 },
      { lat: -48, lon: 3 }, { lat: -48, lon: -3 },
    ];

    buildingBushes.forEach((pos, index) => {
      this.createBush(pos.lat, pos.lon, index % 2 === 0 ? bushMaterial : bushMaterialLight);
    });
  }

  /**
   * Create a bush/shrub at the specified position
   */
  createBush(lat, lon, material) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Create bush from multiple overlapping spheres for organic shape
    const bushGroup = new THREE.Group();

    // Main bush body (3 overlapping spheres)
    const sizes = [0.5, 0.4, 0.35];
    const offsets = [
      { x: 0, y: 0, z: 0 },
      { x: 0.25, y: 0.15, z: 0.1 },
      { x: -0.2, y: 0.1, z: -0.15 },
    ];

    sizes.forEach((size, i) => {
      const sphereGeo = new THREE.SphereGeometry(size, 8, 6);
      const sphere = new THREE.Mesh(sphereGeo, material);
      sphere.position.set(offsets[i].x, offsets[i].y + size, offsets[i].z);
      sphere.castShadow = true;
      bushGroup.add(sphere);
    });

    // Position and orient bush on planet surface
    bushGroup.position.copy(surfacePos);
    bushGroup.quaternion.copy(orientation);

    this.scene.add(bushGroup);
    this.meshes.push(bushGroup);

    // Add collision for the main sphere
    const collisionGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const collisionMesh = new THREE.Mesh(collisionGeo, material);
    collisionMesh.position.copy(surfacePos.clone().add(up.clone().multiplyScalar(0.5)));
    collisionMesh.visible = false;
    this.collisionMeshes.push(collisionMesh);

    this.props.push({ mesh: bushGroup, type: 'bush', lat, lon });
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

    // Create an outline for the planet (thick for silhouette effect)
    const planetOutline = createThickOutlineMesh(planetMesh, 0.15);
    this.scene.add(planetOutline);
    this.meshes.push(planetOutline);

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
    // Main portfolio buildings with detailed facades
    // Skills Building - Forest Grove (West)
    this.createBuilding({
      lat: 0,
      lon: 90,
      name: 'Skills Library',
      type: 'apartment',
      color: BUILDING_COLORS.cream,
      neonColor: NEON_COLORS.blue,
      width: 7,
      height: 12,
      depth: 6,
      floors: 4,
    });

    // Projects Building - Mountain Peak (North)
    this.createBuilding({
      lat: 45,
      lon: 0,
      name: 'Projects Tower',
      type: 'apartment',
      color: BUILDING_COLORS.warmGray,
      neonColor: NEON_COLORS.pink,
      width: 8,
      height: 16,
      depth: 7,
      floors: 5,
    });

    // Music Shop - Beach (East)
    this.createBuilding({
      lat: 0,
      lon: -90,
      name: 'Vinyl Records',
      type: 'shop',
      color: BUILDING_COLORS.coral,
      neonColor: NEON_COLORS.green,
      width: 6,
      height: 8,
      depth: 5,
      floors: 3,
    });

    // Contact Building - Harbor (South)
    this.createBuilding({
      lat: -45,
      lon: 0,
      name: 'Contact Cafe',
      type: 'shop',
      color: BUILDING_COLORS.mint,
      neonColor: NEON_COLORS.orange,
      width: 6,
      height: 7,
      depth: 5,
      floors: 3,
    });

    // Additional background buildings for density (messenger.abeto.co style)
    const backgroundBuildings = [
      { lat: 15, lon: 70, color: BUILDING_COLORS.cream, floors: 4 },
      { lat: -15, lon: 70, color: BUILDING_COLORS.warmGray, floors: 3 },
      { lat: 15, lon: 110, color: BUILDING_COLORS.coolGray, floors: 5 },
      { lat: -15, lon: 110, color: BUILDING_COLORS.coral, floors: 3 },
      { lat: 30, lon: -30, color: BUILDING_COLORS.cream, floors: 4 },
      { lat: -30, lon: -30, color: BUILDING_COLORS.mint, floors: 3 },
      { lat: 30, lon: 30, color: BUILDING_COLORS.warmGray, floors: 5 },
      { lat: -30, lon: 30, color: BUILDING_COLORS.coolGray, floors: 4 },
      { lat: 20, lon: 150, color: BUILDING_COLORS.cream, floors: 3 },
      { lat: -20, lon: 150, color: BUILDING_COLORS.coral, floors: 4 },
      { lat: 25, lon: -120, color: BUILDING_COLORS.mint, floors: 3 },
      { lat: -25, lon: -120, color: BUILDING_COLORS.warmGray, floors: 5 },
    ];

    backgroundBuildings.forEach((bldg, index) => {
      const width = 5 + Math.random() * 3;
      const height = 6 + bldg.floors * 2.5;
      const depth = 4 + Math.random() * 2;

      this.createBuilding({
        lat: bldg.lat,
        lon: bldg.lon,
        name: `Building ${index + 1}`,
        type: 'apartment',
        color: bldg.color,
        neonColor: Object.values(NEON_COLORS)[index % Object.values(NEON_COLORS).length],
        width,
        height,
        depth,
        floors: bldg.floors,
      });
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

    // Add architectural details (rooftop, awning, AC units)
    this.addBuildingDetails(building, width, height, depth, color);

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
   * Add architectural details to buildings (rooftop, awning, AC units, fire escapes, water tanks)
   */
  addBuildingDetails(building, width, height, depth, baseColor) {
    // Rooftop parapet/edge
    const parapetGeo = new THREE.BoxGeometry(width + 0.3, 0.25, depth + 0.3);
    const parapetColor = this.darkenColor(baseColor, 0.15);
    const parapetMat = createToonMaterial({ color: parapetColor });
    const parapet = new THREE.Mesh(parapetGeo, parapetMat);
    parapet.position.y = height / 2 + 0.125;
    parapet.castShadow = true;
    building.add(parapet);
    this.meshes.push(parapet);

    // Awning over door (front face)
    const awningGeo = new THREE.BoxGeometry(width * 0.6, 0.12, 0.8);
    const awningMat = createToonMaterial({ color: 0xB22222 }); // Red awning
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, -height / 2 + 2.5, depth / 2 + 0.4);
    awning.castShadow = true;
    building.add(awning);
    this.meshes.push(awning);

    // Awning stripe (decorative)
    const stripeGeo = new THREE.BoxGeometry(width * 0.6, 0.05, 0.82);
    const stripeMat = createToonMaterial({ color: 0xFFFFFF });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, -height / 2 + 2.55, depth / 2 + 0.4);
    building.add(stripe);
    this.meshes.push(stripe);

    // AC unit on side (random side)
    const acGeo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
    const acMat = createToonMaterial({ color: 0x757575 }); // Gray metal
    const acUnit = new THREE.Mesh(acGeo, acMat);
    const acSide = Math.random() > 0.5 ? 1 : -1;
    acUnit.position.set(acSide * (width / 2 + 0.3), 0, 0);
    acUnit.castShadow = true;
    building.add(acUnit);
    this.meshes.push(acUnit);

    // AC unit outline
    const acOutline = createOutlineMesh(acUnit, 0.02);
    acOutline.position.copy(acUnit.position);
    building.add(acOutline);
    this.meshes.push(acOutline);

    // Door frame
    const doorFrameGeo = new THREE.BoxGeometry(1.4, 2.4, 0.08);
    const doorFrameMat = createToonMaterial({ color: 0x3D3D3D });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(0, -height / 2 + 1.3, depth / 2 + 0.01);
    building.add(doorFrame);
    this.meshes.push(doorFrame);

    // Door (slightly recessed)
    const doorGeo = new THREE.BoxGeometry(1.2, 2.2, 0.06);
    const doorMat = createToonMaterial({ color: 0x5D4037 }); // Brown door
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, -height / 2 + 1.3, depth / 2 + 0.04);
    building.add(door);
    this.meshes.push(door);

    // Chimney on roof (for shorter buildings)
    if (height < 8) {
      const chimneyGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
      const chimneyMat = createToonMaterial({ color: 0x8B4513 });
      const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
      chimney.position.set(width / 4, height / 2 + 0.6, -depth / 4);
      chimney.castShadow = true;
      building.add(chimney);
      this.meshes.push(chimney);
    }

    // Fire escape on taller buildings (height > 8)
    if (height > 8) {
      this.addFireEscape(building, width, height, depth);
    }

    // Water tank on roof for taller buildings (height > 10)
    if (height > 10) {
      this.addWaterTank(building, width, height, depth);
    }

    // Window sills for visual depth
    this.addWindowSills(building, width, height, depth);
  }

  /**
   * Add a fire escape to the side of a building (NYC brownstone style)
   */
  addFireEscape(building, width, height, depth) {
    const metalMat = createToonMaterial({ color: 0x2A2A2A }); // Dark metal
    const platformCount = Math.floor((height - 3) / 3);
    const side = -1; // Left side of building

    for (let i = 0; i < platformCount; i++) {
      const platformY = -height / 2 + 3 + i * 3;

      // Platform
      const platformGeo = new THREE.BoxGeometry(1.5, 0.06, 1.2);
      const platform = new THREE.Mesh(platformGeo, metalMat);
      platform.position.set(side * (width / 2 + 0.75), platformY, 0);
      platform.castShadow = true;
      building.add(platform);
      this.meshes.push(platform);

      // Railings - front
      const railFrontGeo = new THREE.BoxGeometry(1.5, 0.5, 0.03);
      const railFront = new THREE.Mesh(railFrontGeo, metalMat);
      railFront.position.set(0, 0.28, 0.58);
      platform.add(railFront);
      this.meshes.push(railFront);

      // Railings - side
      const railSideGeo = new THREE.BoxGeometry(0.03, 0.5, 1.2);
      const railSide = new THREE.Mesh(railSideGeo, metalMat);
      railSide.position.set(side * 0.73, 0.28, 0);
      platform.add(railSide);
      this.meshes.push(railSide);

      // Ladder between platforms (except top)
      if (i < platformCount - 1) {
        const ladderGeo = new THREE.BoxGeometry(0.4, 2.8, 0.06);
        const ladder = new THREE.Mesh(ladderGeo, metalMat);
        ladder.position.set(side * (width / 2 + 0.9), platformY + 1.5, -0.4);
        building.add(ladder);
        this.meshes.push(ladder);

        // Ladder rungs
        for (let r = 0; r < 5; r++) {
          const rungGeo = new THREE.BoxGeometry(0.4, 0.04, 0.08);
          const rung = new THREE.Mesh(rungGeo, metalMat);
          rung.position.set(0, -1.2 + r * 0.55, 0);
          ladder.add(rung);
          this.meshes.push(rung);
        }
      }
    }

    // Drop ladder at bottom (angled)
    const dropLadderGeo = new THREE.BoxGeometry(0.4, 2.0, 0.06);
    const dropLadder = new THREE.Mesh(dropLadderGeo, metalMat);
    dropLadder.position.set(side * (width / 2 + 1.1), -height / 2 + 1.5, -0.4);
    dropLadder.rotation.z = side * 0.3;
    building.add(dropLadder);
    this.meshes.push(dropLadder);
  }

  /**
   * Add a rooftop water tank (NYC iconic element)
   */
  addWaterTank(building, width, height, depth) {
    const woodMat = createToonMaterial({ color: 0x6B4423 }); // Dark wood
    const metalMat = createToonMaterial({ color: 0x3D3D3D });

    // Tank body (cylinder)
    const tankGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.8, 10);
    const tank = new THREE.Mesh(tankGeo, woodMat);
    tank.position.set(-width / 4, height / 2 + 1.8, -depth / 4);
    tank.castShadow = true;
    building.add(tank);
    this.meshes.push(tank);

    // Conical roof
    const roofGeo = new THREE.ConeGeometry(0.9, 0.6, 10);
    const roof = new THREE.Mesh(roofGeo, metalMat);
    roof.position.set(0, 1.2, 0);
    tank.add(roof);
    this.meshes.push(roof);

    // Metal bands around tank
    const bandGeo = new THREE.TorusGeometry(0.85, 0.03, 6, 16);
    const band1 = new THREE.Mesh(bandGeo, metalMat);
    band1.position.set(0, 0.5, 0);
    band1.rotation.x = Math.PI / 2;
    tank.add(band1);
    this.meshes.push(band1);

    const band2 = new THREE.Mesh(bandGeo, metalMat);
    band2.position.set(0, -0.3, 0);
    band2.rotation.x = Math.PI / 2;
    tank.add(band2);
    this.meshes.push(band2);

    // Support legs (4)
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legPositions = [
      { x: 0.5, z: 0.5 },
      { x: 0.5, z: -0.5 },
      { x: -0.5, z: 0.5 },
      { x: -0.5, z: -0.5 },
    ];

    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(pos.x, -1.3, pos.z);
      tank.add(leg);
      this.meshes.push(leg);
    });

    // Tank outline
    const tankOutline = createOutlineMesh(tank, 0.03);
    tankOutline.position.copy(tank.position);
    building.add(tankOutline);
    this.meshes.push(tankOutline);
  }

  /**
   * Add window sills for visual depth
   */
  addWindowSills(building, width, height, depth) {
    const sillMat = createToonMaterial({ color: 0x757575 }); // Gray stone

    const windowSize = 1.0;
    const windowGap = 0.6;
    const windowsPerRow = Math.floor((width - 1) / (windowSize + windowGap));
    const windowRows = Math.floor((height - 2) / (windowSize + windowGap));

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        // Position relative to building
        const localX = (col - (windowsPerRow - 1) / 2) * (windowSize + windowGap);
        const localY = height / 2 - 1 - row * (windowSize + windowGap) - 0.5;

        // Window sill (small ledge under window)
        const sillGeo = new THREE.BoxGeometry(windowSize + 0.2, 0.08, 0.12);
        const sill = new THREE.Mesh(sillGeo, sillMat);
        sill.position.set(localX, localY, depth / 2 + 0.05);
        sill.castShadow = true;
        building.add(sill);
        this.meshes.push(sill);
      }
    }
  }

  /**
   * Darken a hex color by a factor
   */
  darkenColor(hexColor, factor) {
    const color = new THREE.Color(hexColor);
    color.multiplyScalar(1 - factor);
    return color.getHex();
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

        // Mark 30% of windows as "dark" - they stay unlit at night for realism
        windowMesh.userData.isDarkWindow = Math.random() < 0.3;

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
   * Create props (trees, benches, NYC props, etc.) on the planet
   * Increased density for messenger.abeto.co visual parity
   */
  createProps() {
    // Create trees around the planet - increased density
    const treePositions = [
      { lat: 10, lon: 45 },
      { lat: -10, lon: 45 },
      { lat: 20, lon: -45 },
      { lat: -20, lon: -45 },
      { lat: 15, lon: 135 },
      { lat: -15, lon: 135 },
      { lat: 10, lon: -135 },
      { lat: -10, lon: -135 },
      // Additional trees for density
      { lat: 25, lon: 60 },
      { lat: -25, lon: 60 },
      { lat: 30, lon: -60 },
      { lat: -30, lon: -60 },
      { lat: 5, lon: 160 },
      { lat: -5, lon: 160 },
      { lat: 35, lon: 120 },
      { lat: -35, lon: 120 },
      { lat: 15, lon: -160 },
      { lat: -15, lon: -160 },
      { lat: 40, lon: 30 },
      { lat: -40, lon: 30 },
    ];

    treePositions.forEach((pos) => {
      this.createTree(pos.lat, pos.lon);
    });

    // Create benches - increased density
    const benchPositions = [
      { lat: 5, lon: 30 },
      { lat: -5, lon: -30 },
      { lat: 10, lon: 60 },
      { lat: -10, lon: -60 },
      { lat: 15, lon: 150 },
      { lat: -15, lon: -150 },
      { lat: 20, lon: 25 },
      { lat: -20, lon: -25 },
    ];

    benchPositions.forEach((pos) => {
      this.createBench(pos.lat, pos.lon);
    });

    // Create street lights - increased density
    const lightPositions = [
      { lat: 0, lon: 45 },
      { lat: 0, lon: -45 },
      { lat: 0, lon: 135 },
      { lat: 0, lon: -135 },
      { lat: 20, lon: 20 },
      { lat: -20, lon: -20 },
      { lat: 30, lon: 70 },
      { lat: -30, lon: -70 },
      { lat: 25, lon: -110 },
      { lat: -25, lon: 110 },
      { lat: 10, lon: 180 },
      { lat: -10, lon: 180 },
    ];

    lightPositions.forEach((pos) => {
      this.createStreetLight(pos.lat, pos.lon);
    });

    // NYC Props - taxis
    const taxiPositions = [
      { lat: 5, lon: 50 },
      { lat: -8, lon: -55 },
      { lat: 12, lon: 140 },
      { lat: -12, lon: -140 },
    ];

    taxiPositions.forEach((pos) => {
      this.createTaxi(pos.lat, pos.lon);
    });

    // Fire hydrants
    const hydrantPositions = [
      { lat: 3, lon: 35 },
      { lat: -3, lon: -35 },
      { lat: 8, lon: 125 },
      { lat: -8, lon: -125 },
      { lat: 15, lon: 75 },
      { lat: -15, lon: -75 },
    ];

    hydrantPositions.forEach((pos) => {
      this.createFireHydrant(pos.lat, pos.lon);
    });

    // Mailboxes
    const mailboxPositions = [
      { lat: 2, lon: 55 },
      { lat: -2, lon: -55 },
      { lat: 6, lon: 145 },
      { lat: -6, lon: -145 },
    ];

    mailboxPositions.forEach((pos) => {
      this.createMailbox(pos.lat, pos.lon);
    });

    // Trash cans
    const trashCanPositions = [
      { lat: 4, lon: 40 },
      { lat: -4, lon: -40 },
      { lat: 7, lon: 130 },
      { lat: -7, lon: -130 },
      { lat: 12, lon: 65 },
      { lat: -12, lon: -65 },
      { lat: 18, lon: 155 },
      { lat: -18, lon: -155 },
    ];

    trashCanPositions.forEach((pos) => {
      this.createTrashCan(pos.lat, pos.lon);
    });

    // Hot dog carts
    const hotDogCartPositions = [
      { lat: 6, lon: 70 },
      { lat: -20, lon: -15 },
    ];

    hotDogCartPositions.forEach((pos) => {
      this.createHotDogCart(pos.lat, pos.lon);
    });

    // Japanese-style vending machines (8)
    const vendingMachinePositions = [
      { lat: 5, lon: 85 },
      { lat: -5, lon: 85 },
      { lat: 10, lon: -85 },
      { lat: -10, lon: -85 },
      { lat: 40, lon: 10 },
      { lat: -40, lon: -10 },
      { lat: 20, lon: 50 },
      { lat: -20, lon: -50 },
    ];

    vendingMachinePositions.forEach((pos) => {
      this.createVendingMachine(pos.lat, pos.lon);
    });

    // Japanese post boxes (4)
    const postBoxPositions = [
      { lat: 8, lon: 88 },
      { lat: -8, lon: -88 },
      { lat: 42, lon: 5 },
      { lat: -42, lon: -5 },
    ];

    postBoxPositions.forEach((pos) => {
      this.createJapanesePostBox(pos.lat, pos.lon);
    });

    // Bicycles (6)
    const bicyclePositions = [
      { lat: 3, lon: 82 },
      { lat: -3, lon: -82 },
      { lat: 38, lon: 8 },
      { lat: -38, lon: -8 },
      { lat: 15, lon: 60 },
      { lat: -15, lon: -60 },
    ];

    bicyclePositions.forEach((pos) => {
      this.createBicycle(pos.lat, pos.lon);
    });

    // Street signs (4)
    const streetSignPositions = [
      { lat: 0, lon: 50, direction: 'right' },
      { lat: 0, lon: -50, direction: 'left' },
      { lat: 25, lon: 0, direction: 'right' },
      { lat: -25, lon: 0, direction: 'left' },
    ];

    streetSignPositions.forEach((pos) => {
      this.createStreetSign(pos.lat, pos.lon, pos.direction);
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

    // Outline for trunk
    const trunkOutline = createOutlineMesh(trunk, 0.03);
    trunkOutline.position.copy(trunk.position);
    trunkOutline.quaternion.copy(trunk.quaternion);
    this.scene.add(trunkOutline);
    this.meshes.push(trunkOutline);

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

    // Outline for foliage (increased for graphic novel style)
    const foliageOutline = createOutlineMesh(foliage, 0.05);
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

    // Outline for bench seat
    const seatOutline = createOutlineMesh(seat, 0.025);
    seatOutline.position.copy(seat.position);
    seatOutline.quaternion.copy(seat.quaternion);
    this.scene.add(seatOutline);
    this.meshes.push(seatOutline);

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

    // Outline for street light pole
    const poleOutline = createOutlineMesh(pole, 0.02);
    poleOutline.position.copy(pole.position);
    poleOutline.quaternion.copy(pole.quaternion);
    this.scene.add(poleOutline);
    this.meshes.push(poleOutline);

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

    // Glow sprite (additive blending for soft corona effect)
    const glowMaterial = new THREE.SpriteMaterial({
      color: 0xFFE4B5,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(1.2, 1.2, 1);
    glowSprite.position.set(0, -0.15, 0);
    fixture.add(glowSprite);

    // Point light
    const pointLight = new THREE.PointLight(0xFFE4B5, 0, 12);
    pointLight.position.set(0, -0.15, 0);
    fixture.add(pointLight);

    this.lights.push({ light: pointLight, mesh: bulb, glow: glowSprite, type: 'streetlight' });
    this.props.push({ mesh: pole, type: 'streetlight', lat, lon });

    // Store pole reference for power line connections
    if (!this.streetLightPoles) {
      this.streetLightPoles = [];
    }
    this.streetLightPoles.push({
      position: polePos.clone().add(up.clone().multiplyScalar(2)), // Top of pole
      lat,
      lon,
    });
  }

  /**
   * Create power lines between nearby street light poles
   */
  createPowerLines() {
    if (!this.streetLightPoles || this.streetLightPoles.length < 2) return;

    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x1A1A1A,
      linewidth: 1,
    });

    // Define which poles should be connected (based on proximity)
    const connections = [
      // Equator connections (poles at lat 0)
      { from: { lat: 0, lon: 45 }, to: { lat: 0, lon: 135 } },
      { from: { lat: 0, lon: 135 }, to: { lat: 10, lon: 180 } },
      { from: { lat: 10, lon: 180 }, to: { lat: 0, lon: -135 } },
      { from: { lat: 0, lon: -135 }, to: { lat: 0, lon: -45 } },
      // Northern connections
      { from: { lat: 20, lon: 20 }, to: { lat: 30, lon: 70 } },
      { from: { lat: 30, lon: 70 }, to: { lat: 25, lon: -110 } },
      // Southern connections
      { from: { lat: -20, lon: -20 }, to: { lat: -30, lon: -70 } },
      { from: { lat: -30, lon: -70 }, to: { lat: -25, lon: 110 } },
      // Cross connections (north-south)
      { from: { lat: 0, lon: 45 }, to: { lat: 20, lon: 20 } },
      { from: { lat: 0, lon: -45 }, to: { lat: -20, lon: -20 } },
    ];

    connections.forEach(({ from, to }) => {
      const fromPole = this.streetLightPoles.find(
        (p) => p.lat === from.lat && p.lon === from.lon
      );
      const toPole = this.streetLightPoles.find(
        (p) => p.lat === to.lat && p.lon === to.lon
      );

      if (fromPole && toPole) {
        this.createPowerLine(fromPole.position, toPole.position, wireMaterial);
      }
    });
  }

  /**
   * Create a sagging power line between two points
   */
  createPowerLine(start, end, material) {
    const points = [];
    const segments = 20;

    // Create a catenary curve (natural sag of a hanging cable)
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      // Linear interpolation for base position
      const point = new THREE.Vector3().lerpVectors(start, end, t);

      // Add sag (catenary approximation using parabola)
      // Sag is maximum at middle (t=0.5) and zero at ends
      const sagAmount = 0.8; // How much the wire sags
      const sag = sagAmount * Math.sin(t * Math.PI);

      // Get the "down" direction at this point on the sphere
      const up = this.planet.getUpVector(point);
      point.add(up.clone().multiplyScalar(-sag));

      points.push(point);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    this.scene.add(line);
    this.meshes.push(line);
  }

  /**
   * Create a yellow NYC taxi at the specified position
   */
  createTaxi(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Taxi body
    const bodyGeom = new THREE.BoxGeometry(1.8, 0.6, 0.9);
    const bodyMaterial = createToonMaterial({ color: NYC_COLORS.taxi });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.5));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Taxi roof/cab
    const roofGeom = new THREE.BoxGeometry(0.9, 0.35, 0.7);
    const roofMaterial = createToonMaterial({ color: NYC_COLORS.taxi });
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.set(-0.1, 0.47, 0);
    roof.castShadow = true;
    body.add(roof);
    this.meshes.push(roof);

    // Wheels (4)
    const wheelGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12);
    const wheelMaterial = createToonMaterial({ color: 0x1A1A1A });

    const wheelPositions = [
      { x: 0.6, y: -0.2, z: 0.5 },
      { x: 0.6, y: -0.2, z: -0.5 },
      { x: -0.6, y: -0.2, z: 0.5 },
      { x: -0.6, y: -0.2, z: -0.5 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.x = Math.PI / 2;
      body.add(wheel);
      this.meshes.push(wheel);
    });

    // Taxi sign on roof (lights up at night)
    const signGeom = new THREE.BoxGeometry(0.3, 0.12, 0.15);
    const signMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.3,
    });
    const sign = new THREE.Mesh(signGeom, signMaterial);
    sign.position.set(0, 0.24, 0);
    roof.add(sign);
    this.neonSigns.push({ mesh: sign, color: 0xFFFFFF, type: 'taxiSign' });

    // Outline for taxi
    const outline = createOutlineMesh(body, 0.03);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'taxi', lat, lon });
  }

  /**
   * Create a red fire hydrant at the specified position
   */
  createFireHydrant(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Main body cylinder
    const bodyGeom = new THREE.CylinderGeometry(0.12, 0.15, 0.45, 8);
    const bodyMaterial = createToonMaterial({ color: NYC_COLORS.hydrant });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.225));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Top cap
    const capGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8);
    const cap = new THREE.Mesh(capGeom, bodyMaterial);
    cap.position.set(0, 0.27, 0);
    body.add(cap);
    this.meshes.push(cap);

    // Side nozzles (2)
    const nozzleGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6);
    const nozzle1 = new THREE.Mesh(nozzleGeom, bodyMaterial);
    nozzle1.position.set(0.14, 0.05, 0);
    nozzle1.rotation.z = Math.PI / 2;
    body.add(nozzle1);
    this.meshes.push(nozzle1);

    const nozzle2 = new THREE.Mesh(nozzleGeom, bodyMaterial);
    nozzle2.position.set(-0.14, 0.05, 0);
    nozzle2.rotation.z = -Math.PI / 2;
    body.add(nozzle2);
    this.meshes.push(nozzle2);

    // Outline
    const outline = createOutlineMesh(body, 0.02);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'hydrant', lat, lon });
  }

  /**
   * Create a USPS blue mailbox at the specified position
   */
  createMailbox(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Mailbox body (rounded top)
    const bodyGeom = new THREE.BoxGeometry(0.35, 0.55, 0.3);
    const bodyMaterial = createToonMaterial({ color: NYC_COLORS.mailbox });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.45));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Rounded top
    const topGeom = new THREE.CylinderGeometry(0.175, 0.175, 0.35, 8, 1, false, 0, Math.PI);
    const top = new THREE.Mesh(topGeom, bodyMaterial);
    top.position.set(0, 0.275, 0);
    top.rotation.x = Math.PI / 2;
    top.rotation.y = Math.PI / 2;
    body.add(top);
    this.meshes.push(top);

    // Mail slot
    const slotGeom = new THREE.BoxGeometry(0.2, 0.02, 0.05);
    const slotMaterial = createToonMaterial({ color: 0x002855 }); // Darker blue
    const slot = new THREE.Mesh(slotGeom, slotMaterial);
    slot.position.set(0, 0.1, 0.16);
    body.add(slot);
    this.meshes.push(slot);

    // Pedestal/base
    const baseGeom = new THREE.BoxGeometry(0.25, 0.15, 0.22);
    const base = new THREE.Mesh(baseGeom, bodyMaterial);
    base.position.set(0, -0.35, 0);
    body.add(base);
    this.meshes.push(base);

    // Outline
    const outline = createOutlineMesh(body, 0.02);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'mailbox', lat, lon });
  }

  /**
   * Create a dark green trash can at the specified position
   */
  createTrashCan(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Trash can body (cylinder)
    const bodyGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.45, 10);
    const bodyMaterial = createToonMaterial({ color: NYC_COLORS.trashCan });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.225));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Lid
    const lidGeom = new THREE.CylinderGeometry(0.2, 0.18, 0.05, 10);
    const lid = new THREE.Mesh(lidGeom, bodyMaterial);
    lid.position.set(0, 0.25, 0);
    body.add(lid);
    this.meshes.push(lid);

    // Rim detail
    const rimGeom = new THREE.TorusGeometry(0.18, 0.02, 6, 12);
    const rim = new THREE.Mesh(rimGeom, bodyMaterial);
    rim.position.set(0, 0.2, 0);
    rim.rotation.x = Math.PI / 2;
    body.add(rim);
    this.meshes.push(rim);

    // Outline
    const outline = createOutlineMesh(body, 0.02);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'trashCan', lat, lon });
  }

  /**
   * Create a hot dog cart at the specified position
   */
  createHotDogCart(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Cart body
    const cartGeom = new THREE.BoxGeometry(1.0, 0.5, 0.6);
    const cartMaterial = createToonMaterial({ color: 0x8B8B8B }); // Silver cart
    const cart = new THREE.Mesh(cartGeom, cartMaterial);

    const cartPos = surfacePos.clone().add(up.clone().multiplyScalar(0.5));
    cart.position.copy(cartPos);
    cart.quaternion.copy(orientation);
    cart.castShadow = true;

    this.scene.add(cart);
    this.meshes.push(cart);
    this.collisionMeshes.push(cart);

    // Umbrella pole
    const poleGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6);
    const poleMaterial = createToonMaterial({ color: 0x3D3D3D });
    const pole = new THREE.Mesh(poleGeom, poleMaterial);
    pole.position.set(0, 0.75, 0);
    cart.add(pole);
    this.meshes.push(pole);

    // Umbrella top (red with white stripes look)
    const umbrellaGeom = new THREE.ConeGeometry(0.6, 0.3, 8);
    const umbrellaMaterial = createToonMaterial({ color: NYC_COLORS.hotDogCart });
    const umbrella = new THREE.Mesh(umbrellaGeom, umbrellaMaterial);
    umbrella.position.set(0, 1.3, 0);
    umbrella.rotation.x = Math.PI;
    umbrella.castShadow = true;
    cart.add(umbrella);
    this.meshes.push(umbrella);

    // White stripes on umbrella
    const stripeGeom = new THREE.ConeGeometry(0.62, 0.05, 8);
    const stripeMaterial = createToonMaterial({ color: 0xFFFFFF });
    const stripe = new THREE.Mesh(stripeGeom, stripeMaterial);
    stripe.position.set(0, 1.15, 0);
    stripe.rotation.x = Math.PI;
    cart.add(stripe);
    this.meshes.push(stripe);

    // Wheels (2)
    const wheelGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10);
    const wheelMaterial = createToonMaterial({ color: 0x1A1A1A });

    const wheel1 = new THREE.Mesh(wheelGeom, wheelMaterial);
    wheel1.position.set(-0.4, -0.2, 0.35);
    wheel1.rotation.x = Math.PI / 2;
    cart.add(wheel1);
    this.meshes.push(wheel1);

    const wheel2 = new THREE.Mesh(wheelGeom, wheelMaterial);
    wheel2.position.set(-0.4, -0.2, -0.35);
    wheel2.rotation.x = Math.PI / 2;
    cart.add(wheel2);
    this.meshes.push(wheel2);

    // Handle
    const handleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
    const handle = new THREE.Mesh(handleGeom, poleMaterial);
    handle.position.set(0.55, 0.1, 0);
    handle.rotation.z = Math.PI / 4;
    cart.add(handle);
    this.meshes.push(handle);

    // Outline
    const outline = createOutlineMesh(cart, 0.025);
    outline.position.copy(cart.position);
    outline.quaternion.copy(cart.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: cart, type: 'hotDogCart', lat, lon });
  }

  /**
   * Create a Japanese-style vending machine at the specified position
   */
  createVendingMachine(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Choose random color for vending machine
    const vendingColors = [0x2E5090, 0xCC3333, 0x228B22]; // Blue, red, green
    const machineColor = vendingColors[Math.floor(Math.random() * vendingColors.length)];

    // Main body
    const bodyGeom = new THREE.BoxGeometry(0.9, 1.6, 0.7);
    const bodyMaterial = createToonMaterial({ color: machineColor });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.8));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Display window (dark glass)
    const windowGeom = new THREE.BoxGeometry(0.7, 0.9, 0.05);
    const windowMaterial = createToonMaterial({ color: 0x1A2A3A }); // Dark glass
    const displayWindow = new THREE.Mesh(windowGeom, windowMaterial);
    displayWindow.position.set(0, 0.2, 0.33);
    body.add(displayWindow);
    this.meshes.push(displayWindow);

    // Drink bottles inside (colored cylinders)
    const bottleColors = [0xFF3333, 0x33FF33, 0x3333FF, 0xFFFF33, 0xFF6600, 0x00FFFF];
    const bottleGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const bottleColor = bottleColors[(row * 4 + col) % bottleColors.length];
        const bottleMaterial = createToonMaterial({ color: bottleColor });
        const bottle = new THREE.Mesh(bottleGeom, bottleMaterial);
        bottle.position.set(
          -0.22 + col * 0.15,
          0.45 - row * 0.3,
          0.25
        );
        body.add(bottle);
        this.meshes.push(bottle);
      }
    }

    // Top light panel (glows at night)
    const lightPanelGeom = new THREE.BoxGeometry(0.85, 0.2, 0.65);
    const lightPanelMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.3,
    });
    const lightPanel = new THREE.Mesh(lightPanelGeom, lightPanelMaterial);
    lightPanel.position.set(0, 0.8, 0);
    body.add(lightPanel);
    this.meshes.push(lightPanel);
    this.neonSigns.push({ mesh: lightPanel, color: 0xFFFFFF, type: 'vendingLight' });

    // Coin slot panel
    const coinPanelGeom = new THREE.BoxGeometry(0.15, 0.2, 0.06);
    const coinPanelMaterial = createToonMaterial({ color: 0x3D3D3D });
    const coinPanel = new THREE.Mesh(coinPanelGeom, coinPanelMaterial);
    coinPanel.position.set(0.3, -0.3, 0.33);
    body.add(coinPanel);
    this.meshes.push(coinPanel);

    // Coin slot
    const coinSlotGeom = new THREE.BoxGeometry(0.08, 0.02, 0.02);
    const coinSlotMaterial = createToonMaterial({ color: 0x1A1A1A });
    const coinSlot = new THREE.Mesh(coinSlotGeom, coinSlotMaterial);
    coinSlot.position.set(0, 0.05, 0.02);
    coinPanel.add(coinSlot);
    this.meshes.push(coinSlot);

    // Dispensing slot at bottom
    const dispensingGeom = new THREE.BoxGeometry(0.4, 0.2, 0.2);
    const dispensingMaterial = createToonMaterial({ color: 0x1A1A1A });
    const dispensingSlot = new THREE.Mesh(dispensingGeom, dispensingMaterial);
    dispensingSlot.position.set(0, -0.65, 0.25);
    body.add(dispensingSlot);
    this.meshes.push(dispensingSlot);

    // Dispensing slot interior (darker)
    const interiorGeom = new THREE.BoxGeometry(0.35, 0.15, 0.15);
    const interiorMaterial = createToonMaterial({ color: 0x0A0A0A });
    const interior = new THREE.Mesh(interiorGeom, interiorMaterial);
    interior.position.set(0, 0, 0.03);
    dispensingSlot.add(interior);
    this.meshes.push(interior);

    // Outline for main body
    const outline = createOutlineMesh(body, 0.04);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'vendingMachine', lat, lon });
  }

  /**
   * Create a Japanese-style yellow post box at the specified position
   */
  createJapanesePostBox(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Main body (yellow cylinder)
    const bodyGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.9, 16);
    const bodyMaterial = createToonMaterial({ color: 0xE8B84A }); // Yellow
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);

    const bodyPos = surfacePos.clone().add(up.clone().multiplyScalar(0.45));
    body.position.copy(bodyPos);
    body.quaternion.copy(orientation);
    body.castShadow = true;

    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Rounded top (half sphere)
    const topGeom = new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = new THREE.Mesh(topGeom, bodyMaterial);
    top.position.set(0, 0.45, 0);
    body.add(top);
    this.meshes.push(top);

    // Red stripe across middle
    const stripeGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.1, 16);
    const stripeMaterial = createToonMaterial({ color: 0xCC3333 }); // Red
    const stripe = new THREE.Mesh(stripeGeom, stripeMaterial);
    stripe.position.set(0, 0.1, 0);
    body.add(stripe);
    this.meshes.push(stripe);

    // Mail slot (dark horizontal opening)
    const slotGeom = new THREE.BoxGeometry(0.2, 0.02, 0.1);
    const slotMaterial = createToonMaterial({ color: 0x1A1A1A });
    const slot = new THREE.Mesh(slotGeom, slotMaterial);
    slot.position.set(0.2, 0.25, 0);
    slot.rotation.y = Math.PI / 2;
    body.add(slot);
    this.meshes.push(slot);

    // White collection time panel
    const panelGeom = new THREE.BoxGeometry(0.15, 0.1, 0.02);
    const panelMaterial = createToonMaterial({ color: 0xFFFFFF });
    const panel = new THREE.Mesh(panelGeom, panelMaterial);
    panel.position.set(0.2, -0.1, 0);
    panel.rotation.y = Math.PI / 2;
    body.add(panel);
    this.meshes.push(panel);

    // Base/pedestal
    const baseGeom = new THREE.CylinderGeometry(0.28, 0.3, 0.15, 16);
    const baseMaterial = createToonMaterial({ color: 0xD4A84A }); // Slightly darker yellow
    const base = new THREE.Mesh(baseGeom, baseMaterial);
    base.position.set(0, -0.52, 0);
    body.add(base);
    this.meshes.push(base);

    // Outline for body
    const outline = createOutlineMesh(body, 0.025);
    outline.position.copy(body.position);
    outline.quaternion.copy(body.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    this.props.push({ mesh: body, type: 'japanesePostBox', lat, lon });
  }

  /**
   * Create a bicycle at the specified position
   */
  createBicycle(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Bicycle group
    const bikeGroup = new THREE.Group();

    // Frame material
    const frameMaterial = createToonMaterial({ color: 0x4A4A4A }); // Dark gray frame
    const wheelMaterial = createToonMaterial({ color: 0x1A1A1A }); // Black tires

    // Front wheel
    const wheelGeom = new THREE.TorusGeometry(0.25, 0.025, 8, 24);
    const frontWheel = new THREE.Mesh(wheelGeom, wheelMaterial);
    frontWheel.position.set(0.4, 0.25, 0);
    frontWheel.rotation.y = Math.PI / 2;
    bikeGroup.add(frontWheel);
    this.meshes.push(frontWheel);

    // Front wheel spokes (simple cross)
    const spokeGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.45, 6);
    const spokeMaterial = createToonMaterial({ color: 0x8A8A8A });
    const spoke1 = new THREE.Mesh(spokeGeom, spokeMaterial);
    spoke1.position.copy(frontWheel.position);
    spoke1.rotation.z = Math.PI / 2;
    bikeGroup.add(spoke1);
    this.meshes.push(spoke1);

    const spoke2 = new THREE.Mesh(spokeGeom, spokeMaterial);
    spoke2.position.copy(frontWheel.position);
    bikeGroup.add(spoke2);
    this.meshes.push(spoke2);

    // Rear wheel
    const rearWheel = new THREE.Mesh(wheelGeom, wheelMaterial);
    rearWheel.position.set(-0.4, 0.25, 0);
    rearWheel.rotation.y = Math.PI / 2;
    bikeGroup.add(rearWheel);
    this.meshes.push(rearWheel);

    // Rear wheel spokes
    const spoke3 = new THREE.Mesh(spokeGeom, spokeMaterial);
    spoke3.position.copy(rearWheel.position);
    spoke3.rotation.z = Math.PI / 2;
    bikeGroup.add(spoke3);
    this.meshes.push(spoke3);

    const spoke4 = new THREE.Mesh(spokeGeom, spokeMaterial);
    spoke4.position.copy(rearWheel.position);
    bikeGroup.add(spoke4);
    this.meshes.push(spoke4);

    // Frame tubes
    const frameGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6);

    // Top tube (horizontal)
    const topTube = new THREE.Mesh(frameGeom, frameMaterial);
    topTube.position.set(0, 0.55, 0);
    topTube.rotation.z = Math.PI / 2;
    bikeGroup.add(topTube);
    this.meshes.push(topTube);

    // Down tube (diagonal front)
    const downTube = new THREE.Mesh(frameGeom, frameMaterial);
    downTube.position.set(0.2, 0.4, 0);
    downTube.rotation.z = Math.PI / 4;
    bikeGroup.add(downTube);
    this.meshes.push(downTube);

    // Seat tube (vertical)
    const seatTube = new THREE.Mesh(frameGeom, frameMaterial);
    seatTube.position.set(-0.15, 0.5, 0);
    bikeGroup.add(seatTube);
    this.meshes.push(seatTube);

    // Chain stay (diagonal rear)
    const chainStay = new THREE.Mesh(frameGeom, frameMaterial);
    chainStay.position.set(-0.28, 0.4, 0);
    chainStay.rotation.z = -Math.PI / 4;
    bikeGroup.add(chainStay);
    this.meshes.push(chainStay);

    // Seat stay (diagonal rear upper)
    const seatStay = new THREE.Mesh(frameGeom, frameMaterial);
    seatStay.position.set(-0.28, 0.5, 0);
    seatStay.rotation.z = Math.PI / 6;
    bikeGroup.add(seatStay);
    this.meshes.push(seatStay);

    // Fork (front vertical tube)
    const forkGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6);
    const fork = new THREE.Mesh(forkGeom, frameMaterial);
    fork.position.set(0.4, 0.42, 0);
    bikeGroup.add(fork);
    this.meshes.push(fork);

    // Handlebars
    const handlebarGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6);
    const handlebar = new THREE.Mesh(handlebarGeom, frameMaterial);
    handlebar.position.set(0.4, 0.65, 0);
    handlebar.rotation.x = Math.PI / 2;
    bikeGroup.add(handlebar);
    this.meshes.push(handlebar);

    // Handlebar grips
    const gripGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8);
    const gripMaterial = createToonMaterial({ color: 0x2A2A2A });
    const leftGrip = new THREE.Mesh(gripGeom, gripMaterial);
    leftGrip.position.set(0.4, 0.65, 0.18);
    leftGrip.rotation.x = Math.PI / 2;
    bikeGroup.add(leftGrip);
    this.meshes.push(leftGrip);

    const rightGrip = new THREE.Mesh(gripGeom, gripMaterial);
    rightGrip.position.set(0.4, 0.65, -0.18);
    rightGrip.rotation.x = Math.PI / 2;
    bikeGroup.add(rightGrip);
    this.meshes.push(rightGrip);

    // Seat
    const seatGeom = new THREE.BoxGeometry(0.2, 0.05, 0.12);
    const seatMaterial = createToonMaterial({ color: 0x5A3A2A }); // Brown
    const seat = new THREE.Mesh(seatGeom, seatMaterial);
    seat.position.set(-0.15, 0.75, 0);
    bikeGroup.add(seat);
    this.meshes.push(seat);

    // Seat post
    const seatPostGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 6);
    const seatPost = new THREE.Mesh(seatPostGeom, frameMaterial);
    seatPost.position.set(-0.15, 0.68, 0);
    bikeGroup.add(seatPost);
    this.meshes.push(seatPost);

    // Kickstand
    const kickstandGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6);
    const kickstandMaterial = createToonMaterial({ color: 0x3D3D3D });
    const kickstand = new THREE.Mesh(kickstandGeom, kickstandMaterial);
    kickstand.position.set(-0.1, 0.15, 0.08);
    kickstand.rotation.z = Math.PI / 6;
    kickstand.rotation.x = -Math.PI / 12;
    bikeGroup.add(kickstand);
    this.meshes.push(kickstand);

    // Pedals
    const pedalGeom = new THREE.BoxGeometry(0.08, 0.02, 0.05);
    const pedalMaterial = createToonMaterial({ color: 0x2A2A2A });
    const leftPedal = new THREE.Mesh(pedalGeom, pedalMaterial);
    leftPedal.position.set(0, 0.25, 0.12);
    bikeGroup.add(leftPedal);
    this.meshes.push(leftPedal);

    const rightPedal = new THREE.Mesh(pedalGeom, pedalMaterial);
    rightPedal.position.set(0, 0.25, -0.12);
    bikeGroup.add(rightPedal);
    this.meshes.push(rightPedal);

    // Position and orient bicycle on planet surface
    bikeGroup.position.copy(surfacePos.clone().add(up.clone().multiplyScalar(0.02)));
    bikeGroup.quaternion.copy(orientation);

    this.scene.add(bikeGroup);
    this.meshes.push(bikeGroup);

    this.props.push({ mesh: bikeGroup, type: 'bicycle', lat, lon });
  }

  /**
   * Create a street sign at the specified position
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} direction - 'left' or 'right' for arrow direction
   */
  createStreetSign(lat, lon, direction = 'right') {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Sign group
    const signGroup = new THREE.Group();

    // Pole
    const poleGeom = new THREE.CylinderGeometry(0.04, 0.05, 2.5, 8);
    const poleMaterial = createToonMaterial({ color: 0x5A5A5A }); // Gray
    const pole = new THREE.Mesh(poleGeom, poleMaterial);
    pole.position.set(0, 1.25, 0);
    pole.castShadow = true;
    signGroup.add(pole);
    this.meshes.push(pole);

    // Sign panel (green)
    const panelGeom = new THREE.BoxGeometry(0.8, 0.25, 0.03);
    const panelMaterial = createToonMaterial({ color: 0x006400 }); // Dark green
    const panel = new THREE.Mesh(panelGeom, panelMaterial);
    panel.position.set(0, 2.3, 0.1);
    panel.castShadow = true;
    signGroup.add(panel);
    this.meshes.push(panel);

    // White text area (simulated text strip)
    const textAreaGeom = new THREE.BoxGeometry(0.65, 0.12, 0.01);
    const textMaterial = createToonMaterial({ color: 0xFFFFFF });
    const textArea = new THREE.Mesh(textAreaGeom, textMaterial);
    textArea.position.set(0, 0, 0.02);
    panel.add(textArea);
    this.meshes.push(textArea);

    // Arrow indicator
    const arrowGroup = new THREE.Group();

    // Arrow shaft
    const arrowShaftGeom = new THREE.BoxGeometry(0.2, 0.04, 0.01);
    const arrowMaterial = createToonMaterial({ color: 0xFFFFFF });
    const arrowShaft = new THREE.Mesh(arrowShaftGeom, arrowMaterial);
    arrowGroup.add(arrowShaft);
    this.meshes.push(arrowShaft);

    // Arrow head (triangle made from thin box rotated)
    const arrowHeadGeom = new THREE.ConeGeometry(0.05, 0.1, 3);
    const arrowHead = new THREE.Mesh(arrowHeadGeom, arrowMaterial);
    arrowHead.rotation.z = direction === 'left' ? Math.PI / 2 : -Math.PI / 2;
    arrowHead.position.x = direction === 'left' ? -0.12 : 0.12;
    arrowGroup.add(arrowHead);
    this.meshes.push(arrowHead);

    arrowGroup.position.set(0, -0.02, 0.02);
    panel.add(arrowGroup);

    // Second sign panel (optional cross-street style)
    const panel2Geom = new THREE.BoxGeometry(0.6, 0.2, 0.03);
    const panel2 = new THREE.Mesh(panel2Geom, panelMaterial);
    panel2.position.set(0, 2.05, 0.1);
    panel2.castShadow = true;
    signGroup.add(panel2);
    this.meshes.push(panel2);

    // White text area for second panel
    const textArea2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.01),
      textMaterial
    );
    textArea2.position.set(0, 0, 0.02);
    panel2.add(textArea2);
    this.meshes.push(textArea2);

    // Outline for pole
    const poleOutline = createOutlineMesh(pole, 0.02);
    poleOutline.position.copy(pole.position);
    signGroup.add(poleOutline);
    this.meshes.push(poleOutline);

    // Position and orient sign on planet surface
    signGroup.position.copy(surfacePos.clone().add(up.clone().multiplyScalar(0.02)));
    signGroup.quaternion.copy(orientation);

    this.scene.add(signGroup);
    this.meshes.push(signGroup);
    this.collisionMeshes.push(pole);

    this.props.push({ mesh: signGroup, type: 'streetSign', lat, lon });
  }

  /**
   * Set time of day and update lighting
   */
  setTimeOfDay(time) {
    this.timeOfDay = time;

    // Day and night colors
    const dayWindowColor = new THREE.Color(0x87CEEB); // Sky blue reflection
    const nightWindowColor = new THREE.Color(0xFFE082); // Warm interior light

    // Update street lights
    this.lights.forEach(({ light, mesh, glow, type }) => {
      if (type === 'streetlight' && light) {
        // Street light intensity increases at night
        light.intensity = time * 3;
        if (mesh && mesh.material) {
          // Bulb glows brighter at night
          mesh.material.opacity = 0.3 + time * 0.7;
          // Add emissive glow
          if (mesh.material.emissive) {
            mesh.material.emissive.setHex(0xFFE4B5);
            mesh.material.emissiveIntensity = time * 2;
          }
        }
        // Glow sprite visibility (additive blending corona)
        if (glow && glow.material) {
          glow.material.opacity = time * 0.5; // Soft glow at night
          // Scale glow based on time for bloom-like effect
          const glowScale = 1.2 + time * 0.6;
          glow.scale.set(glowScale, glowScale, 1);
        }
      } else if (type === 'neon' && light) {
        // Neon lights are always somewhat visible, brighter at night
        light.intensity = 0.3 + time * 2.0;
      }
    });

    // Update neon signs with color intensity
    this.neonSigns.forEach(({ mesh, color }) => {
      if (mesh && mesh.material) {
        // Neon signs glow brighter at night
        const brightness = 0.6 + time * 0.4;
        mesh.material.opacity = brightness;
        // Make neon more vivid at night
        if (mesh.material.color && color) {
          const neonColor = new THREE.Color(color);
          neonColor.multiplyScalar(0.7 + time * 0.5);
          mesh.material.color.copy(neonColor);
        }
      }
    });

    // Dark window colors (30% of windows stay unlit at night for realism)
    const darkWindowColor = new THREE.Color(0x2A3040); // Dark blue-gray

    // Update windows - transition from blue (day) to warm yellow (night)
    // Some windows (marked as dark) stay unlit at night for realism
    this.windowMeshes.forEach((mesh) => {
      if (mesh.material) {
        const isDark = mesh.userData.isDarkWindow;

        if (isDark) {
          // Dark windows: stay blue during day, become dark at night
          const windowColor = dayWindowColor.clone().lerp(darkWindowColor, time);
          mesh.material.color.copy(windowColor);

          // Dark windows stay dim
          if (mesh.material.transparent) {
            mesh.material.opacity = 0.3;
          }
        } else {
          // Normal windows: transition from blue to warm yellow
          const windowColor = dayWindowColor.clone().lerp(nightWindowColor, time);
          mesh.material.color.copy(windowColor);

          // Windows become more opaque/lit at night
          if (mesh.material.transparent) {
            mesh.material.opacity = 0.3 + time * 0.5;
          }
        }
      }
    });
  }

  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  update(deltaTime) {
    // Track animation time
    this.animationTime = (this.animationTime || 0) + deltaTime;

    // Animate neon signs with subtle flicker (only at night)
    if (this.timeOfDay > 0.3) {
      this.neonSigns.forEach(({ mesh, color, type }, index) => {
        if (mesh && mesh.material) {
          // Different flicker patterns for each sign
          const flickerSpeed = 8 + index * 2;
          const flickerAmount = 0.1;

          // Subtle brightness flicker using noise-like pattern
          const flicker = 1.0 + Math.sin(this.animationTime * flickerSpeed) * flickerAmount
            * Math.sin(this.animationTime * flickerSpeed * 0.7 + index) * 0.5;

          // Apply flicker to opacity
          const baseOpacity = 0.6 + this.timeOfDay * 0.4;
          mesh.material.opacity = baseOpacity * flicker;
        }
      });

      // Animate neon point lights
      this.lights.forEach(({ light, type }, index) => {
        if (type === 'neon' && light) {
          const flickerSpeed = 6 + index;
          const flicker = 1.0 + Math.sin(this.animationTime * flickerSpeed) * 0.15;
          const baseIntensity = 0.3 + this.timeOfDay * 2.0;
          light.intensity = baseIntensity * flicker;
        }
      });
    }

    // Animate flowers swaying
    if (this.flowerInstances) {
      this.flowerTime = (this.flowerTime || 0) + deltaTime;
      // Flowers would need instance matrix updates for animation
      // Keeping simple for now
    }
  }

  /**
   * Create ground scatter (grass, rocks, flowers) using instancing for performance
   */
  createGroundScatter() {
    this.createGrassPatches();
    this.createRocks();
    this.createFlowers();
  }

  /**
   * Create instanced grass patches across the planet
   */
  createGrassPatches() {
    // Grass blade geometry (thin triangle)
    const grassGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
    const grassColors = [0x558B2F, 0x689F38, 0x7CB342]; // Various green shades

    const dummy = new THREE.Object3D();
    const grassCount = 300;

    // Create instanced mesh for each color variation
    grassColors.forEach((color, colorIndex) => {
      const grassMat = createToonMaterial({ color });
      const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, grassCount / grassColors.length);

      for (let i = 0; i < grassCount / grassColors.length; i++) {
        // Random position on planet (avoiding building areas)
        let lat, lon;
        let attempts = 0;
        do {
          lat = (Math.random() - 0.5) * 120; // -60 to +60 degrees
          lon = Math.random() * 360;
          attempts++;
        } while (this.isNearBuilding(lat, lon) && attempts < 10);

        const pos = this.planet.latLonToPosition(lat, lon);
        const orientation = this.planet.getSurfaceOrientation(pos);

        dummy.position.copy(pos);
        dummy.quaternion.copy(orientation);
        // Random scale and slight rotation
        dummy.scale.set(
          0.5 + Math.random() * 0.5,
          0.6 + Math.random() * 0.8,
          0.5 + Math.random() * 0.5
        );
        // Small random rotation around local Y
        dummy.rotateY(Math.random() * Math.PI * 2);
        dummy.updateMatrix();

        grassInstanced.setMatrixAt(i, dummy.matrix);
      }

      grassInstanced.instanceMatrix.needsUpdate = true;
      grassInstanced.castShadow = true;
      this.scene.add(grassInstanced);
      this.meshes.push(grassInstanced);
    });
  }

  /**
   * Create instanced rocks scattered on the planet
   */
  createRocks() {
    // Low-poly rock geometry
    const rockGeo = new THREE.DodecahedronGeometry(0.2, 0);
    const rockMat = createToonMaterial({ color: 0x757575 }); // Gray
    const rockCount = 60;
    const rockInstanced = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < rockCount; i++) {
      // Random position
      let lat, lon;
      let attempts = 0;
      do {
        lat = (Math.random() - 0.5) * 140;
        lon = Math.random() * 360;
        attempts++;
      } while (this.isNearBuilding(lat, lon) && attempts < 10);

      const pos = this.planet.latLonToPosition(lat, lon);
      const orientation = this.planet.getSurfaceOrientation(pos);

      dummy.position.copy(pos);
      dummy.quaternion.copy(orientation);
      // Random scale (some small, some larger)
      const scale = 0.3 + Math.random() * 0.6;
      dummy.scale.set(
        scale * (0.8 + Math.random() * 0.4),
        scale * (0.6 + Math.random() * 0.3),
        scale * (0.8 + Math.random() * 0.4)
      );
      // Random rotation
      dummy.rotateY(Math.random() * Math.PI * 2);
      dummy.rotateX((Math.random() - 0.5) * 0.3);
      dummy.updateMatrix();

      rockInstanced.setMatrixAt(i, dummy.matrix);
    }

    rockInstanced.instanceMatrix.needsUpdate = true;
    rockInstanced.castShadow = true;
    rockInstanced.receiveShadow = true;
    this.scene.add(rockInstanced);
    this.meshes.push(rockInstanced);
  }

  /**
   * Create instanced flowers scattered on the planet
   */
  createFlowers() {
    // Flower colors
    const flowerColors = [
      { petal: 0xFF69B4, center: 0xFFD700 }, // Pink with yellow center
      { petal: 0xFFFFFF, center: 0xFFD700 }, // White daisy
      { petal: 0x9370DB, center: 0xFFFF00 }, // Purple
      { petal: 0xFF6347, center: 0xFFD700 }, // Red-orange
    ];

    const flowerCount = 80;
    const dummy = new THREE.Object3D();

    // Create each flower type
    flowerColors.forEach((colors, colorIndex) => {
      const count = flowerCount / flowerColors.length;

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.25, 6);
      const stemMat = createToonMaterial({ color: 0x228B22 });
      const stemInstanced = new THREE.InstancedMesh(stemGeo, stemMat, count);

      // Petal (simple cone/circle approximation)
      const petalGeo = new THREE.ConeGeometry(0.12, 0.08, 6);
      const petalMat = createToonMaterial({ color: colors.petal });
      const petalInstanced = new THREE.InstancedMesh(petalGeo, petalMat, count);

      // Center
      const centerGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const centerMat = createToonMaterial({ color: colors.center });
      const centerInstanced = new THREE.InstancedMesh(centerGeo, centerMat, count);

      for (let i = 0; i < count; i++) {
        // Random position
        let lat, lon;
        let attempts = 0;
        do {
          lat = (Math.random() - 0.5) * 100;
          lon = Math.random() * 360;
          attempts++;
        } while (this.isNearBuilding(lat, lon) && attempts < 10);

        const pos = this.planet.latLonToPosition(lat, lon);
        const orientation = this.planet.getSurfaceOrientation(pos);
        const up = this.planet.getUpVector(pos);

        // Stem position
        const stemPos = pos.clone().add(up.clone().multiplyScalar(0.125));
        dummy.position.copy(stemPos);
        dummy.quaternion.copy(orientation);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        stemInstanced.setMatrixAt(i, dummy.matrix);

        // Petal position (on top of stem)
        const petalPos = pos.clone().add(up.clone().multiplyScalar(0.3));
        dummy.position.copy(petalPos);
        dummy.quaternion.copy(orientation);
        // Flip cone to be upside down for petal shape
        dummy.rotateX(Math.PI);
        dummy.updateMatrix();
        petalInstanced.setMatrixAt(i, dummy.matrix);

        // Center position
        const centerPos = pos.clone().add(up.clone().multiplyScalar(0.28));
        dummy.position.copy(centerPos);
        dummy.quaternion.copy(orientation);
        dummy.rotation.set(0, 0, 0); // Reset rotation
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        centerInstanced.setMatrixAt(i, dummy.matrix);
      }

      stemInstanced.instanceMatrix.needsUpdate = true;
      petalInstanced.instanceMatrix.needsUpdate = true;
      centerInstanced.instanceMatrix.needsUpdate = true;

      this.scene.add(stemInstanced);
      this.scene.add(petalInstanced);
      this.scene.add(centerInstanced);

      this.meshes.push(stemInstanced, petalInstanced, centerInstanced);
    });

    this.flowerInstances = true;
  }

  /**
   * Check if a latitude/longitude is near a building
   */
  isNearBuilding(lat, lon) {
    const buildingPositions = [
      { lat: 0, lon: 90 },   // Skills
      { lat: 45, lon: 0 },   // Projects
      { lat: 0, lon: -90 },  // Music
      { lat: -45, lon: 0 },  // Contact
    ];

    const threshold = 20; // degrees

    for (const building of buildingPositions) {
      const latDiff = Math.abs(lat - building.lat);
      const lonDiff = Math.abs(lon - building.lon);
      // Handle longitude wrap-around
      const lonDiffWrapped = Math.min(lonDiff, 360 - lonDiff);

      if (latDiff < threshold && lonDiffWrapped < threshold) {
        return true;
      }
    }
    return false;
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
