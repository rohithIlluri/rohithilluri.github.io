/**
 * Street.js - Enhanced NYC Street Environment
 * Creates the street, sidewalks, buildings with neon signs, and manages street-level objects
 * With enhanced toon materials and emissive elements for bloom
 */

import * as THREE from 'three';
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

export class Street {
  constructor(scene) {
    this.scene = scene;

    // Collections
    this.meshes = [];
    this.collisionMeshes = [];
    this.lights = [];
    this.buildings = [];
    this.neonSigns = [];
    this.windowMeshes = [];

    // Street dimensions
    this.streetWidth = 12;
    this.sidewalkWidth = 4;
    this.blockLength = 60;

    // Time of day (0 = day, 1 = night)
    this.timeOfDay = 0;

    // Light direction for enhanced materials
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();
  }

  async init() {
    this.createGround();
    this.createStreet();
    this.createSidewalks();
    this.createBuildings();
    this.createStreetProps();
    this.createBoundaryWalls();
  }

  /**
   * Set light direction for enhanced toon materials
   * @param {THREE.Vector3} direction
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  createGround() {
    // Create a large ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = createToonMaterial({
      color: 0x3D3D3D, // Dark asphalt base
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01; // Slightly below to prevent z-fighting
    ground.receiveShadow = true;

    this.scene.add(ground);
    this.meshes.push(ground);
  }

  createStreet() {
    // Main street surface (darker asphalt)
    const streetGeometry = new THREE.PlaneGeometry(
      this.streetWidth,
      this.blockLength * 2
    );
    const streetMaterial = createToonMaterial({
      color: 0x2A2A2A,
    });

    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.position.y = 0;
    street.receiveShadow = true;

    this.scene.add(street);
    this.meshes.push(street);

    // Street markings (center line)
    this.createStreetMarkings();
  }

  createStreetMarkings() {
    const markingMaterial = createToonMaterial({
      color: 0xFFD54F, // Yellow road marking
      emissive: 0xFFD54F,
      emissiveIntensity: 0.1, // Subtle glow
    });

    // Dashed center line
    const dashLength = 3;
    const dashGap = 2;
    const dashWidth = 0.15;

    for (let z = -this.blockLength; z < this.blockLength; z += dashLength + dashGap) {
      const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
      const dash = new THREE.Mesh(dashGeometry, markingMaterial);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.01, z + dashLength / 2);
      this.scene.add(dash);
      this.meshes.push(dash);
    }

    // Crosswalks at intersections
    this.createCrosswalk(0, -this.blockLength / 2);
    this.createCrosswalk(0, this.blockLength / 2);
  }

  createCrosswalk(x, z) {
    const whiteMaterial = createToonMaterial({ color: 0xFFFFFF });
    const stripeWidth = 0.6;
    const stripeLength = this.streetWidth - 1;
    const stripeGap = 0.6;
    const numStripes = 8;

    for (let i = 0; i < numStripes; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeLength, stripeWidth),
        whiteMaterial
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(
        x,
        0.02,
        z + (i - numStripes / 2) * (stripeWidth + stripeGap)
      );
      this.scene.add(stripe);
      this.meshes.push(stripe);
    }
  }

  createSidewalks() {
    const sidewalkMaterial = createToonMaterial({
      color: 0x8B8B8B, // Concrete gray
    });

    // East sidewalk
    const eastSidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(this.sidewalkWidth, 0.15, this.blockLength * 2),
      sidewalkMaterial
    );
    eastSidewalk.position.set(
      this.streetWidth / 2 + this.sidewalkWidth / 2,
      0.075,
      0
    );
    eastSidewalk.receiveShadow = true;
    eastSidewalk.castShadow = true;
    this.scene.add(eastSidewalk);
    this.meshes.push(eastSidewalk);

    // West sidewalk
    const westSidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(this.sidewalkWidth, 0.15, this.blockLength * 2),
      sidewalkMaterial
    );
    westSidewalk.position.set(
      -(this.streetWidth / 2 + this.sidewalkWidth / 2),
      0.075,
      0
    );
    westSidewalk.receiveShadow = true;
    westSidewalk.castShadow = true;
    this.scene.add(westSidewalk);
    this.meshes.push(westSidewalk);

    // Add curbs
    this.createCurbs();
  }

  createCurbs() {
    const curbMaterial = createToonMaterial({ color: 0x6B6B6B });
    const curbHeight = 0.2;
    const curbWidth = 0.3;

    // East curb
    const eastCurb = new THREE.Mesh(
      new THREE.BoxGeometry(curbWidth, curbHeight, this.blockLength * 2),
      curbMaterial
    );
    eastCurb.position.set(this.streetWidth / 2 + curbWidth / 2, curbHeight / 2, 0);
    eastCurb.castShadow = true;
    this.scene.add(eastCurb);
    this.meshes.push(eastCurb);
    this.collisionMeshes.push(eastCurb);

    // West curb
    const westCurb = new THREE.Mesh(
      new THREE.BoxGeometry(curbWidth, curbHeight, this.blockLength * 2),
      curbMaterial
    );
    westCurb.position.set(-(this.streetWidth / 2 + curbWidth / 2), curbHeight / 2, 0);
    westCurb.castShadow = true;
    this.scene.add(westCurb);
    this.meshes.push(westCurb);
    this.collisionMeshes.push(westCurb);
  }

  createBuildings() {
    // Each building corresponds to a portfolio section

    // Skills Brownstone (East)
    this.createBrownstone(15, 0, 'Skills Brownstone', NEON_COLORS.blue);

    // Projects Tower (North)
    this.createTower(0, -25, 'Projects Tower', NEON_COLORS.pink);

    // Music Record Shop (West)
    this.createShop(-15, 0, 'Vinyl Records', 0xB22222, NEON_COLORS.green);

    // Contact Coffee Shop (South - near spawn)
    this.createShop(0, 25, 'Contact Coffee', 0x8B4513, NEON_COLORS.orange);

    // Filler buildings
    this.createFillerBuildings();
  }

  createBrownstone(x, z, name, neonColor) {
    const width = 8;
    const height = 12;
    const depth = 10;

    const material = createEnhancedToonMaterial({
      color: 0x8B4513, // Brown
      isCharacter: false,
      lightDirection: this.lightDirection,
    });
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;

    this.scene.add(building);
    this.meshes.push(building);
    this.collisionMeshes.push(building);
    this.buildings.push({ mesh: building, name, type: 'brownstone' });

    // Add windows
    this.addWindows(building, width, height, depth);

    // Add door
    this.addDoor(building, x, z, 0);

    // Add neon sign
    this.addNeonSign(x, height * 0.7, z - depth / 2 - 0.1, name, neonColor, Math.PI);
  }

  createTower(x, z, name, neonColor) {
    const width = 12;
    const height = 25;
    const depth = 12;

    const material = createEnhancedToonMaterial({
      color: 0x4A4A4A, // Dark gray
      isCharacter: false,
      lightDirection: this.lightDirection,
    });
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;

    this.scene.add(building);
    this.meshes.push(building);
    this.collisionMeshes.push(building);
    this.buildings.push({ mesh: building, name, type: 'tower' });

    // Add windows
    this.addWindows(building, width, height, depth);

    // Add door
    this.addDoor(building, x, z + depth / 2 + 0.1, Math.PI);

    // Add large neon sign at top
    this.addNeonSign(x, height - 3, z + depth / 2 + 0.1, 'PROJECTS', neonColor, 0, true);

    // Add rooftop antenna/spire
    this.addRooftopAntenna(x, height, z);
  }

  createShop(x, z, name, color, neonColor) {
    const width = 8;
    const height = 6;
    const depth = 8;

    const material = createEnhancedToonMaterial({
      color: color,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;

    this.scene.add(building);
    this.meshes.push(building);
    this.collisionMeshes.push(building);
    this.buildings.push({ mesh: building, name, type: 'shop' });

    // Add awning
    this.addAwning(building, x, z, width, neonColor);

    // Add door
    const doorZ = z < 0 ? z + depth / 2 + 0.1 : z - depth / 2 - 0.1;
    const doorRot = z < 0 ? Math.PI : 0;
    this.addDoor(building, x, doorZ, doorRot);

    // Add neon sign
    const signZ = z < 0 ? z + depth / 2 + 0.1 : z - depth / 2 - 0.1;
    const signRot = z < 0 ? 0 : Math.PI;
    this.addNeonSign(x, height * 0.8, signZ, name, neonColor, signRot);

    // Add storefront window
    this.addStorefrontWindow(x, z, width, depth);
  }

  addWindows(building, width, height, depth) {
    // Window material that glows at night
    const windowMaterialDay = createToonMaterial({ color: 0x87CEEB }); // Sky blue for reflection
    const windowMaterialNight = new THREE.MeshBasicMaterial({
      color: 0xFFE4B5,
      transparent: true,
      opacity: 0,
    });

    const windowSize = 1.2;
    const windowGap = 0.8;

    const windowsPerRow = Math.floor((width - 2) / (windowSize + windowGap));
    const windowRows = Math.floor((height - 4) / (windowSize + windowGap));

    const startX = -(windowsPerRow - 1) * (windowSize + windowGap) / 2;
    const startY = height / 2 - 1;

    // Front and back windows
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const wx = startX + col * (windowSize + windowGap);
        const wy = startY - row * (windowSize + windowGap) - building.position.y + height / 2;

        // Front window
        const frontWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterialDay.clone()
        );
        frontWindow.position.set(
          building.position.x + wx,
          building.position.y - height / 2 + wy + 2,
          building.position.z + depth / 2 + 0.01
        );
        this.scene.add(frontWindow);
        this.meshes.push(frontWindow);
        this.windowMeshes.push(frontWindow);

        // Night glow layer
        const frontGlow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterialNight.clone()
        );
        frontGlow.position.copy(frontWindow.position);
        frontGlow.position.z += 0.01;
        this.scene.add(frontGlow);
        this.meshes.push(frontGlow);
        this.windowMeshes.push(frontGlow);

        // Back window
        const backWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterialDay.clone()
        );
        backWindow.position.set(
          building.position.x + wx,
          building.position.y - height / 2 + wy + 2,
          building.position.z - depth / 2 - 0.01
        );
        backWindow.rotation.y = Math.PI;
        this.scene.add(backWindow);
        this.meshes.push(backWindow);
        this.windowMeshes.push(backWindow);
      }
    }
  }

  addDoor(building, x, z, rotation) {
    const doorMaterial = createToonMaterial({ color: 0x3D3D3D });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.5, 0.1),
      doorMaterial
    );
    door.position.set(x, 1.25, z);
    door.rotation.y = rotation;
    this.scene.add(door);
    this.meshes.push(door);
  }

  addAwning(building, x, z, width, color) {
    // Striped awning with emissive edge
    const awningMaterial = createToonMaterial({ color: color || 0xB22222 });
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1, 0.3, 2),
      awningMaterial
    );
    awning.position.set(x, building.position.y, z - 5);
    this.scene.add(awning);
    this.meshes.push(awning);

    // Add neon edge to awning
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: color || 0xB22222,
      transparent: true,
      opacity: 0,
    });
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.2, 0.1, 0.1),
      edgeMaterial
    );
    edge.position.set(x, building.position.y - 0.1, z - 6);
    this.scene.add(edge);
    this.neonSigns.push({ mesh: edge, color: color, type: 'edge' });
  }

  addStorefrontWindow(x, z, width, depth) {
    // Large storefront window
    const windowMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.3,
    });

    const storefront = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.6, 2),
      windowMaterial
    );

    const windowZ = z < 0 ? z + depth / 2 + 0.02 : z - depth / 2 - 0.02;
    storefront.position.set(x, 2, windowZ);
    if (z >= 0) storefront.rotation.y = Math.PI;

    this.scene.add(storefront);
    this.meshes.push(storefront);
  }

  /**
   * Add a neon sign to a building
   * @param {number} x X position
   * @param {number} y Y position
   * @param {number} z Z position
   * @param {string} text Text to display (used for naming)
   * @param {number} color Neon color
   * @param {number} rotation Y rotation
   * @param {boolean} large Whether this is a large sign
   */
  addNeonSign(x, y, z, text, color, rotation = 0, large = false) {
    const signWidth = large ? 8 : 4;
    const signHeight = large ? 1.5 : 0.8;

    // Sign background (dark)
    const bgMaterial = createToonMaterial({ color: 0x1A1A2E });
    const bg = new THREE.Mesh(
      new THREE.BoxGeometry(signWidth + 0.4, signHeight + 0.2, 0.1),
      bgMaterial
    );
    bg.position.set(x, y, z);
    bg.rotation.y = rotation;
    this.scene.add(bg);
    this.meshes.push(bg);

    // Neon text representation (simple box with emissive)
    const neonMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
    });
    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(signWidth, signHeight, 0.05),
      neonMaterial
    );
    neon.position.set(x, y, z + (rotation === 0 ? -0.06 : 0.06));
    neon.rotation.y = rotation;
    this.scene.add(neon);
    this.meshes.push(neon);
    this.neonSigns.push({ mesh: neon, color: color, type: 'sign' });

    // Add point light for local glow
    const pointLight = new THREE.PointLight(color, 0, 8);
    pointLight.position.set(x, y, z + (rotation === 0 ? -0.5 : 0.5));
    this.scene.add(pointLight);
    this.lights.push({ light: pointLight, mesh: neon, color: color, type: 'neon' });
  }

  addRooftopAntenna(x, y, z) {
    const antennaMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Main pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, 5, 8),
      antennaMaterial
    );
    pole.position.set(x, y + 2.5, z);
    this.scene.add(pole);
    this.meshes.push(pole);

    // Blinking light at top
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 1,
    });
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      lightMaterial
    );
    light.position.set(x, y + 5, z);
    this.scene.add(light);
    this.meshes.push(light);
    this.neonSigns.push({ mesh: light, color: 0xFF0000, type: 'beacon', blinking: true });
  }

  createFillerBuildings() {
    // Add some background buildings to fill the street
    const colors = [0x6B4423, 0x4A4A4A, 0x8B7355, 0x5C4033];

    // East side fillers
    this.createSimpleBuilding(15, -20, 6, 10, 6, colors[0]);
    this.createSimpleBuilding(15, 20, 6, 8, 6, colors[1]);

    // West side fillers
    this.createSimpleBuilding(-15, -20, 6, 9, 6, colors[2]);
    this.createSimpleBuilding(-15, 20, 6, 11, 6, colors[3]);
  }

  createSimpleBuilding(x, z, width, height, depth, color) {
    const material = createEnhancedToonMaterial({
      color: color,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;

    this.scene.add(building);
    this.meshes.push(building);
    this.collisionMeshes.push(building);

    // Add windows to filler buildings too
    this.addWindows(building, width, height, depth);
  }

  createStreetProps() {
    // Street lights
    this.createStreetLight(8, -15);
    this.createStreetLight(8, 15);
    this.createStreetLight(-8, -15);
    this.createStreetLight(-8, 15);

    // Fire hydrants
    this.createFireHydrant(7, -5);
    this.createFireHydrant(-7, 10);

    // Benches
    this.createBench(9, 0);
    this.createBench(-9, 5);

    // Trash cans
    this.createTrashCan(9, -10);
    this.createTrashCan(-9, -5);
  }

  createStreetLight(x, z) {
    const poleMaterial = createToonMaterial({ color: 0x2A2A2A });
    const poleHeight = 5;

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, poleHeight, 8),
      poleMaterial
    );
    pole.position.set(x, poleHeight / 2, z);
    pole.castShadow = true;
    this.scene.add(pole);
    this.meshes.push(pole);

    // Light fixture
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.4),
      poleMaterial
    );
    fixture.position.set(x, poleHeight, z);
    this.scene.add(fixture);
    this.meshes.push(fixture);

    // Light bulb (emissive when night)
    const bulbMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFE4B5,
      transparent: true,
      opacity: 0,
    });
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      bulbMaterial
    );
    bulb.position.set(x, poleHeight - 0.2, z);
    this.scene.add(bulb);
    this.lights.push({ mesh: bulb, position: new THREE.Vector3(x, poleHeight - 0.2, z) });

    // Add point light for night time
    const pointLight = new THREE.PointLight(0xFFE4B5, 0, 15);
    pointLight.position.set(x, poleHeight - 0.2, z);
    this.scene.add(pointLight);
    this.lights.push({ light: pointLight, mesh: bulb, type: 'streetlight' });
  }

  createFireHydrant(x, z) {
    const material = createToonMaterial({ color: 0xCC0000 }); // Fire red

    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8),
      material
    );
    body.position.set(x, 0.3, z);
    body.castShadow = true;
    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Top
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 0.2, 8),
      material
    );
    top.position.set(x, 0.7, z);
    this.scene.add(top);
    this.meshes.push(top);
  }

  createBench(x, z) {
    const woodMaterial = createToonMaterial({ color: 0x8B4513 });
    const metalMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      woodMaterial
    );
    seat.position.set(x, 0.5, z);
    seat.castShadow = true;
    this.scene.add(seat);
    this.meshes.push(seat);
    this.collisionMeshes.push(seat);

    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 0.1),
      woodMaterial
    );
    back.position.set(x, 0.8, z + 0.2);
    back.castShadow = true;
    this.scene.add(back);
    this.meshes.push(back);

    // Legs
    const legPositions = [
      [-0.6, z - 0.15],
      [0.6, z - 0.15],
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.1),
        metalMaterial
      );
      leg.position.set(x + lx, 0.25, lz);
      this.scene.add(leg);
      this.meshes.push(leg);
    });
  }

  createTrashCan(x, z) {
    const material = createToonMaterial({ color: 0x228B22 }); // Forest green

    const can = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8),
      material
    );
    can.position.set(x, 0.4, z);
    can.castShadow = true;
    this.scene.add(can);
    this.meshes.push(can);
    this.collisionMeshes.push(can);
  }

  createBoundaryWalls() {
    // Invisible collision walls at world boundaries
    const wallMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });

    const wallHeight = 10;
    const worldSize = 50;

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(worldSize * 2, wallHeight, 1),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -worldSize);
    this.scene.add(northWall);
    this.collisionMeshes.push(northWall);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(worldSize * 2, wallHeight, 1),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, worldSize);
    this.scene.add(southWall);
    this.collisionMeshes.push(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, worldSize * 2),
      wallMaterial
    );
    eastWall.position.set(worldSize, wallHeight / 2, 0);
    this.scene.add(eastWall);
    this.collisionMeshes.push(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, worldSize * 2),
      wallMaterial
    );
    westWall.position.set(-worldSize, wallHeight / 2, 0);
    this.scene.add(westWall);
    this.collisionMeshes.push(westWall);
  }

  /**
   * Set time of day and update all lighting elements
   * @param {number} time 0 = day, 1 = night
   */
  setTimeOfDay(time) {
    this.timeOfDay = time;

    // Update street lights
    this.lights.forEach(({ light, mesh, type, color }) => {
      if (type === 'streetlight' && light) {
        light.intensity = time * 2; // Brighten at night
        if (mesh && mesh.material) {
          mesh.material.opacity = time;
        }
      } else if (type === 'neon' && light) {
        // Neon signs are always on but brighter at night
        light.intensity = 0.5 + time * 1.5;
      }
    });

    // Update neon signs
    this.neonSigns.forEach(({ mesh, color, type, blinking }) => {
      if (mesh && mesh.material) {
        if (type === 'beacon' && blinking) {
          // Blinking handled in update()
          return;
        }

        // Neon signs glow more at night
        const baseOpacity = type === 'sign' ? 0.7 : 0.5;
        mesh.material.opacity = baseOpacity + time * 0.3;

        // Increase emissive at night
        if (mesh.material.emissive) {
          mesh.material.emissiveIntensity = time * 0.5;
        }
      }
    });

    // Update windows (glow at night)
    this.windowMeshes.forEach((mesh) => {
      if (mesh.material && mesh.material.color) {
        // Check if it's a glow layer (MeshBasicMaterial with opacity)
        if (mesh.material.transparent) {
          mesh.material.opacity = time * 0.6;
        }
      }
    });
  }

  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  update(deltaTime) {
    // Animate blinking beacon
    this.neonSigns.forEach(({ mesh, blinking }) => {
      if (blinking && mesh && mesh.material) {
        const blink = Math.sin(Date.now() * 0.005) > 0;
        mesh.material.opacity = blink ? 1 : 0.3;
      }
    });
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.scene.remove(mesh);
    });

    this.lights.forEach(({ light }) => {
      if (light) this.scene.remove(light);
    });

    this.meshes = [];
    this.collisionMeshes = [];
    this.lights = [];
    this.neonSigns = [];
    this.windowMeshes = [];
  }
}
