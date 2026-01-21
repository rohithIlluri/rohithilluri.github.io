/**
 * Street.js - Enhanced NYC Street Environment
 * Creates the street, sidewalks, buildings with detailed architecture, and street props
 * Visual quality target: messenger.abeto.co parity with NYC theme
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
  white: 0xFFFFFF,
};

// Building colors (warmer tones per spec)
const BUILDING_COLORS = {
  brownstone: 0x8B5A2B, // Warmer brown
  tower: 0x4A5568,      // Blue-gray
  brick: 0xA0522D,      // Sienna
  concrete: 0x708090,   // Slate gray
  terracotta: 0xCD853F, // Peru
  cream: 0xF5DEB3,      // Wheat
  darkBrown: 0x5D4037,  // Dark brown
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
    this.animatedElements = [];

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

  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  createGround() {
    // Create a large ground plane with grass-like color
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = createToonMaterial({
      color: 0x3D3D3D,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;

    this.scene.add(ground);
    this.meshes.push(ground);
  }

  createStreet() {
    // Main street surface
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

    this.createStreetMarkings();
  }

  createStreetMarkings() {
    const markingMaterial = createToonMaterial({
      color: 0xFFD54F,
      emissive: 0xFFD54F,
      emissiveIntensity: 0.1,
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

    // Crosswalks
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
      color: 0x8B8B8B,
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
    // Skills Brownstone (East)
    this.createBrownstone(15, 0, 'Skills Brownstone', NEON_COLORS.blue);

    // Projects Tower (North)
    this.createTower(0, -25, 'Projects Tower', NEON_COLORS.pink);

    // Music Record Shop (West)
    this.createShop(-15, 0, 'Vinyl Records', 0xB22222, NEON_COLORS.green);

    // Contact Coffee Shop (South)
    this.createCoffeeShop(0, 25, 'Contact Coffee', NEON_COLORS.orange);

    // Filler buildings
    this.createFillerBuildings();
  }

  // ================================================================
  // PHASE 1: ENHANCED BROWNSTONE
  // ================================================================
  createBrownstone(x, z, name, neonColor) {
    const width = 8;
    const height = 12;
    const depth = 10;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const brownMaterial = createEnhancedToonMaterial({
      color: BUILDING_COLORS.brownstone,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    // Main building body
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      brownMaterial
    );
    mainBody.position.y = height / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    // Add outline
    const mainOutline = createOutlineMesh(mainBody, 0.02);
    mainOutline.position.copy(mainBody.position);
    group.add(mainOutline);

    // Decorative cornice at roofline
    this.addCornice(group, width, height, depth);

    // NYC Stoop (entry stairs with railings)
    this.addStoop(group, width, depth);

    // Enhanced windows with frames
    this.addBrownstoneWindows(group, width, height, depth);

    // Fire escape on side
    this.addFireEscape(group, width, height, depth);

    // Flower boxes under some windows
    this.addFlowerBoxes(group, width, height, depth);

    // Door with molding
    this.addEnhancedDoor(group, 0, depth / 2);

    this.scene.add(group);
    this.meshes.push(group);
    this.collisionMeshes.push(mainBody);
    this.buildings.push({ mesh: mainBody, name, type: 'brownstone', group });

    // Add neon sign
    this.addNeonSign(x, height * 0.7, z - depth / 2 - 0.1, name, neonColor, Math.PI);
  }

  addCornice(group, width, height, depth) {
    const corniceMaterial = createToonMaterial({ color: 0x6B4423 });

    // Main cornice
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.6, 0.4, depth + 0.4),
      corniceMaterial
    );
    cornice.position.set(0, height + 0.2, 0);
    cornice.castShadow = true;
    group.add(cornice);

    // Decorative brackets under cornice
    const bracketMaterial = createToonMaterial({ color: 0x5D4037 });
    const bracketCount = 4;
    for (let i = 0; i < bracketCount; i++) {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.5, 0.4),
        bracketMaterial
      );
      const bx = ((i / (bracketCount - 1)) - 0.5) * (width - 1);
      bracket.position.set(bx, height - 0.1, depth / 2 + 0.15);
      group.add(bracket);
    }

    // Top trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.8, 0.15, depth + 0.6),
      corniceMaterial
    );
    trim.position.set(0, height + 0.47, 0);
    group.add(trim);
  }

  addStoop(group, width, depth) {
    const stoneMaterial = createToonMaterial({ color: 0x8B7355 });
    const railMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Steps (5 steps going up)
    const stepCount = 5;
    const stepHeight = 0.25;
    const stepDepth = 0.5;
    const stepWidth = 2.5;

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
        stoneMaterial
      );
      step.position.set(0, stepHeight / 2 + i * stepHeight, depth / 2 + 0.5 + i * stepDepth);
      step.castShadow = true;
      group.add(step);
    }

    // Landing at top of stairs
    const landing = new THREE.Mesh(
      new THREE.BoxGeometry(stepWidth + 0.5, stepHeight, stepDepth + 0.5),
      stoneMaterial
    );
    landing.position.set(0, stepCount * stepHeight + stepHeight / 2, depth / 2 + 0.5 + stepCount * stepDepth);
    landing.castShadow = true;
    group.add(landing);

    // Railings
    const railHeight = 0.8;
    const railWidth = 0.08;

    // Left and right railings
    [-1, 1].forEach(side => {
      // Vertical posts
      for (let i = 0; i < 3; i++) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(railWidth, railWidth, railHeight, 8),
          railMaterial
        );
        post.position.set(
          side * (stepWidth / 2 + 0.1),
          stepHeight * (1 + i * 2) + railHeight / 2,
          depth / 2 + 0.5 + (stepDepth * i * 2)
        );
        group.add(post);
      }

      // Handrail (angled)
      const handrailLength = Math.sqrt(
        Math.pow(stepCount * stepDepth, 2) + Math.pow(stepCount * stepHeight, 2)
      );
      const handrail = new THREE.Mesh(
        new THREE.CylinderGeometry(railWidth * 0.8, railWidth * 0.8, handrailLength + 0.5, 8),
        railMaterial
      );
      const angle = Math.atan2(stepCount * stepHeight, stepCount * stepDepth);
      handrail.rotation.x = Math.PI / 2 - angle;
      handrail.position.set(
        side * (stepWidth / 2 + 0.1),
        stepHeight + stepCount * stepHeight / 2 + railHeight,
        depth / 2 + 0.5 + stepCount * stepDepth / 2
      );
      group.add(handrail);
    });
  }

  addBrownstoneWindows(group, width, height, depth) {
    const windowFrameMaterial = createToonMaterial({ color: 0xF5F5DC });
    const windowGlassMaterial = createToonMaterial({ color: 0x87CEEB });

    const windowWidth = 1.0;
    const windowHeight = 1.6;
    const windowsPerRow = 3;
    const rows = 3;

    // Windows on front face
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const wx = (col - (windowsPerRow - 1) / 2) * 2.2;
        const wy = 3.5 + row * 3;

        // Window frame (recessed)
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(windowWidth + 0.3, windowHeight + 0.3, 0.15),
          windowFrameMaterial
        );
        frame.position.set(wx, wy, depth / 2 + 0.05);
        group.add(frame);

        // Window glass (inset)
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(windowWidth, windowHeight, 0.05),
          windowGlassMaterial
        );
        glass.position.set(wx, wy, depth / 2 + 0.1);
        group.add(glass);
        this.windowMeshes.push(glass);

        // Window sill
        const sill = new THREE.Mesh(
          new THREE.BoxGeometry(windowWidth + 0.5, 0.1, 0.2),
          createToonMaterial({ color: 0x808080 })
        );
        sill.position.set(wx, wy - windowHeight / 2 - 0.1, depth / 2 + 0.1);
        sill.castShadow = true;
        group.add(sill);

        // Window header (decorative top)
        const header = new THREE.Mesh(
          new THREE.BoxGeometry(windowWidth + 0.4, 0.2, 0.15),
          createToonMaterial({ color: 0x6B4423 })
        );
        header.position.set(wx, wy + windowHeight / 2 + 0.15, depth / 2 + 0.1);
        group.add(header);
      }
    }
  }

  addFireEscape(group, width, height, depth) {
    const metalMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Fire escape on the side of building
    const escapeX = -width / 2 - 0.8;
    const platformWidth = 1.5;
    const platformDepth = 3;

    // Platforms at each floor
    for (let floor = 1; floor <= 3; floor++) {
      const platformY = floor * 3 + 0.5;

      // Platform floor (metal grating look)
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(platformWidth, 0.1, platformDepth),
        metalMaterial
      );
      platform.position.set(escapeX, platformY, 0);
      platform.castShadow = true;
      group.add(platform);

      // Railings
      const railHeight = 0.9;
      const railings = [
        { x: escapeX - platformWidth / 2 + 0.05, z: 0 },
        { x: escapeX + platformWidth / 2 - 0.05, z: 0 },
        { x: escapeX, z: platformDepth / 2 - 0.05 },
        { x: escapeX, z: -platformDepth / 2 + 0.05 },
      ];

      railings.forEach(pos => {
        const rail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, railHeight, 6),
          metalMaterial
        );
        rail.position.set(pos.x, platformY + railHeight / 2, pos.z);
        group.add(rail);
      });

      // Ladder between floors (if not top floor)
      if (floor < 3) {
        const ladderHeight = 2.5;
        const ladder = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, ladderHeight, 0.1),
          metalMaterial
        );
        ladder.position.set(escapeX, platformY + ladderHeight / 2 + 0.5, platformDepth / 2 - 0.5);
        group.add(ladder);

        // Ladder rungs
        for (let r = 0; r < 6; r++) {
          const rung = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6),
            metalMaterial
          );
          rung.rotation.z = Math.PI / 2;
          rung.position.set(escapeX, platformY + 0.7 + r * 0.4, platformDepth / 2 - 0.5);
          group.add(rung);
        }
      }
    }

    // Support brackets to building
    for (let floor = 1; floor <= 3; floor++) {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.15, 0.15),
        metalMaterial
      );
      bracket.position.set(escapeX + platformWidth / 2 + 0.4, floor * 3 + 0.5, 0);
      group.add(bracket);
    }
  }

  addFlowerBoxes(group, width, height, depth) {
    const boxMaterial = createToonMaterial({ color: 0x8B4513 });
    const flowerMaterial = createToonMaterial({ color: 0xFF69B4 });
    const greenMaterial = createToonMaterial({ color: 0x228B22 });

    // Add flower boxes to second row of windows
    const windowsPerRow = 3;
    for (let col = 0; col < windowsPerRow; col++) {
      if (col === 1) continue; // Skip middle window

      const wx = (col - (windowsPerRow - 1) / 2) * 2.2;
      const wy = 6.5 - 0.8 - 0.4;

      // Planter box
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.25, 0.3),
        boxMaterial
      );
      box.position.set(wx, wy, depth / 2 + 0.25);
      box.castShadow = true;
      group.add(box);

      // Greenery
      const greenery = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        greenMaterial
      );
      greenery.scale.set(1.8, 0.6, 0.8);
      greenery.position.set(wx, wy + 0.25, depth / 2 + 0.25);
      group.add(greenery);

      // Small flowers
      for (let f = 0; f < 3; f++) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          flowerMaterial
        );
        flower.position.set(
          wx + (f - 1) * 0.3,
          wy + 0.4,
          depth / 2 + 0.25
        );
        group.add(flower);
      }
    }
  }

  addEnhancedDoor(group, offsetX, offsetZ) {
    const doorFrameMaterial = createToonMaterial({ color: 0x4A3728 });
    const doorMaterial = createToonMaterial({ color: 0x2A1810 });
    const handleMaterial = createToonMaterial({ color: 0xD4AF37 });

    // Door frame
    const frameWidth = 2;
    const frameHeight = 3;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth + 0.4, frameHeight + 0.2, 0.15),
      doorFrameMaterial
    );
    frame.position.set(offsetX, 1.5 + 1.25, offsetZ + 3);
    group.add(frame);

    // Door panel
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth, frameHeight, 0.1),
      doorMaterial
    );
    door.position.set(offsetX, 1.5 + 1.25, offsetZ + 3.05);
    door.castShadow = true;
    group.add(door);

    // Door handle
    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      handleMaterial
    );
    handle.position.set(offsetX + 0.7, 1.5 + 1.25, offsetZ + 3.12);
    group.add(handle);

    // Transom window above door
    const transomMaterial = createToonMaterial({ color: 0x87CEEB });
    const transom = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth - 0.2, 0.5, 0.05),
      transomMaterial
    );
    transom.position.set(offsetX, 1.5 + frameHeight + 0.1, offsetZ + 3.1);
    group.add(transom);
    this.windowMeshes.push(transom);
  }

  // ================================================================
  // PHASE 1: ENHANCED TOWER (Art Deco Style)
  // ================================================================
  createTower(x, z, name, neonColor) {
    const baseWidth = 12;
    const baseHeight = 25;
    const baseDepth = 12;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const towerMaterial = createEnhancedToonMaterial({
      color: BUILDING_COLORS.tower,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    // Art Deco setbacks (stepped profile)
    const setbacks = [
      { width: baseWidth, height: 15, depth: baseDepth, y: 0 },
      { width: baseWidth - 2, height: 6, depth: baseDepth - 2, y: 15 },
      { width: baseWidth - 4, height: 4, depth: baseDepth - 4, y: 21 },
    ];

    setbacks.forEach((s, i) => {
      const section = new THREE.Mesh(
        new THREE.BoxGeometry(s.width, s.height, s.depth),
        towerMaterial
      );
      section.position.y = s.y + s.height / 2;
      section.castShadow = true;
      section.receiveShadow = true;
      group.add(section);

      // Outline for each section
      const outline = createOutlineMesh(section, 0.02);
      outline.position.copy(section.position);
      group.add(outline);

      // Add ledge/trim at each setback
      if (i > 0) {
        const ledgeMaterial = createToonMaterial({ color: 0x5A6A7A });
        const ledge = new THREE.Mesh(
          new THREE.BoxGeometry(s.width + 0.4, 0.3, s.depth + 0.4),
          ledgeMaterial
        );
        ledge.position.y = s.y + 0.15;
        ledge.castShadow = true;
        group.add(ledge);
      }

      // Add to collision for base section only
      if (i === 0) {
        this.collisionMeshes.push(section);
      }
    });

    // Glass curtain wall effect (vertical window strips)
    this.addGlassCurtainWall(group, baseWidth, 15, baseDepth);

    // Rooftop water tank
    this.addWaterTank(group, baseHeight);

    // Decorative crown/spire
    this.addArtDecoCrown(group, baseWidth - 4, baseHeight);

    // LED accent lighting for night mode
    this.addLEDAccents(group, baseWidth, baseHeight, baseDepth);

    // Enhanced entrance
    this.addTowerEntrance(group, baseWidth, baseDepth);

    this.scene.add(group);
    this.meshes.push(group);
    this.buildings.push({ mesh: group, name, type: 'tower', group });

    // Add large neon sign
    this.addNeonSign(x, baseHeight - 3, z + baseDepth / 2 + 0.1, 'PROJECTS', neonColor, 0, true);

    // Antenna
    this.addRooftopAntenna(x, baseHeight, z);
  }

  addGlassCurtainWall(group, width, height, depth) {
    const glassMaterial = createToonMaterial({ color: 0x6BB3D9 });
    const frameMaterial = createToonMaterial({ color: 0x2A3A4A });

    const windowWidth = 1.0;
    const windowHeight = 2.5;
    const windowsPerRow = 4;
    const rows = 5;

    // Front and back faces
    [depth / 2, -depth / 2].forEach((faceZ, faceIndex) => {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          const wx = (col - (windowsPerRow - 1) / 2) * 2.5;
          const wy = 2 + row * 2.8;

          // Window frame
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth + 0.2, windowHeight + 0.2, 0.1),
            frameMaterial
          );
          const zOffset = faceIndex === 0 ? 0.02 : -0.02;
          frame.position.set(wx, wy, faceZ + zOffset);
          if (faceIndex === 1) frame.rotation.y = Math.PI;
          group.add(frame);

          // Glass pane
          const glass = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth, windowHeight, 0.05),
            glassMaterial
          );
          glass.position.set(wx, wy, faceZ + zOffset * 2);
          if (faceIndex === 1) glass.rotation.y = Math.PI;
          group.add(glass);
          this.windowMeshes.push(glass);
        }
      }
    });
  }

  addWaterTank(group, baseHeight) {
    const tankMaterial = createToonMaterial({ color: 0x5D4037 });
    const legMaterial = createToonMaterial({ color: 0x3D3D3D });

    // Tank body (cylindrical)
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 2.5, 12),
      tankMaterial
    );
    tank.position.set(3, baseHeight + 2, -2);
    tank.castShadow = true;
    group.add(tank);

    // Tank roof (cone)
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.8, 12),
      tankMaterial
    );
    roof.position.set(3, baseHeight + 3.65, -2);
    group.add(roof);

    // Support legs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 2, 6),
        legMaterial
      );
      leg.position.set(
        3 + Math.cos(angle) * 1.2,
        baseHeight + 0.5,
        -2 + Math.sin(angle) * 1.2
      );
      group.add(leg);
    }
  }

  addArtDecoCrown(group, crownWidth, baseHeight) {
    const crownMaterial = createToonMaterial({ color: 0xB8860B }); // Gold

    // Stepped crown
    const crownSteps = [
      { width: crownWidth + 0.5, height: 0.5, depth: crownWidth + 0.5 },
      { width: crownWidth - 1, height: 1, depth: crownWidth - 1 },
      { width: crownWidth - 2.5, height: 1.5, depth: crownWidth - 2.5 },
    ];

    let currentY = baseHeight;
    crownSteps.forEach(step => {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(step.width, step.height, step.depth),
        crownMaterial
      );
      stepMesh.position.y = currentY + step.height / 2;
      stepMesh.castShadow = true;
      group.add(stepMesh);
      currentY += step.height;
    });

    // Spire on top
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 3, 8),
      crownMaterial
    );
    spire.position.y = currentY + 1.5;
    group.add(spire);
  }

  addLEDAccents(group, width, height, depth) {
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: 0x00BFFF,
      transparent: true,
      opacity: 0,
    });

    // LED strips along setback edges
    const ledStrips = [
      { y: 15, width: width - 2, depth: depth - 2 },
      { y: 21, width: width - 4, depth: depth - 4 },
    ];

    ledStrips.forEach(led => {
      // Front strip
      const frontLed = new THREE.Mesh(
        new THREE.BoxGeometry(led.width, 0.1, 0.1),
        ledMaterial.clone()
      );
      frontLed.position.set(0, led.y + 0.05, led.depth / 2);
      group.add(frontLed);
      this.neonSigns.push({ mesh: frontLed, color: 0x00BFFF, type: 'led' });

      // Back strip
      const backLed = new THREE.Mesh(
        new THREE.BoxGeometry(led.width, 0.1, 0.1),
        ledMaterial.clone()
      );
      backLed.position.set(0, led.y + 0.05, -led.depth / 2);
      group.add(backLed);
      this.neonSigns.push({ mesh: backLed, color: 0x00BFFF, type: 'led' });
    });
  }

  addTowerEntrance(group, width, depth) {
    const entranceMaterial = createToonMaterial({ color: 0x3A4A5A });
    const glassMaterial = createToonMaterial({ color: 0x87CEEB });
    const goldMaterial = createToonMaterial({ color: 0xD4AF37 });

    // Entrance canopy
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.3, 2),
      entranceMaterial
    );
    canopy.position.set(0, 3.5, depth / 2 + 1);
    canopy.castShadow = true;
    group.add(canopy);

    // Glass entrance doors
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 3, 0.1),
      entranceMaterial
    );
    doorFrame.position.set(0, 1.5, depth / 2 + 0.02);
    group.add(doorFrame);

    // Glass panels
    [-0.7, 0.7].forEach(offsetX => {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 2.5, 0.05),
        glassMaterial
      );
      glass.position.set(offsetX, 1.5, depth / 2 + 0.05);
      group.add(glass);
      this.windowMeshes.push(glass);
    });

    // Gold trim around entrance
    const topTrim = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.15, 0.2),
      goldMaterial
    );
    topTrim.position.set(0, 3.1, depth / 2 + 0.1);
    group.add(topTrim);
  }

  // ================================================================
  // PHASE 1: ENHANCED SHOP STOREFRONTS
  // ================================================================
  createShop(x, z, name, color, neonColor) {
    const width = 8;
    const height = 6;
    const depth = 8;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const shopMaterial = createEnhancedToonMaterial({
      color: color,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    // Main building
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      shopMaterial
    );
    mainBody.position.y = height / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    // Outline
    const outline = createOutlineMesh(mainBody, 0.02);
    outline.position.copy(mainBody.position);
    group.add(outline);

    // Enhanced striped awning
    this.addStripedAwning(group, width, height, depth, neonColor);

    // Large display window with visible interior
    this.addDisplayWindow(group, width, depth, 'records');

    // Neon tube sign
    this.addNeonTubeSign(group, 0, height * 0.75, depth / 2, name, neonColor);

    // A-frame sandwich board
    this.addSandwichBoard(group, -2, depth / 2 + 2);

    this.scene.add(group);
    this.meshes.push(group);
    this.collisionMeshes.push(mainBody);
    this.buildings.push({ mesh: mainBody, name, type: 'shop', group });
  }

  createCoffeeShop(x, z, name, neonColor) {
    const width = 8;
    const height = 6;
    const depth = 8;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const shopMaterial = createEnhancedToonMaterial({
      color: 0x8B4513,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    // Main building
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      shopMaterial
    );
    mainBody.position.y = height / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    // Outline
    const outline = createOutlineMesh(mainBody, 0.02);
    outline.position.copy(mainBody.position);
    group.add(outline);

    // Enhanced striped awning
    this.addStripedAwning(group, width, height, -depth, neonColor);

    // Large display window
    this.addDisplayWindow(group, width, -depth, 'coffee');

    // Coffee cup neon sign
    this.addCoffeeCupSign(group, 0, height * 0.8, -depth / 2 - 0.1);

    // Outdoor cafe furniture
    this.addCafeFurniture(group, depth);

    // A-frame sandwich board
    this.addSandwichBoard(group, 2, -depth / 2 - 2);

    this.scene.add(group);
    this.meshes.push(group);
    this.collisionMeshes.push(mainBody);
    this.buildings.push({ mesh: mainBody, name, type: 'coffee', group });

    // Neon sign
    this.addNeonSign(x, height * 0.7, z - depth / 2 - 0.1, name, neonColor, Math.PI);
  }

  addStripedAwning(group, width, height, depth, color) {
    const stripeCount = 6;
    const awningWidth = width + 1;
    const awningDepth = 2;
    const stripeWidth = awningWidth / stripeCount;

    const awningGroup = new THREE.Group();
    const awningY = height - 0.5;
    const awningZ = depth > 0 ? depth / 2 + awningDepth / 2 : depth / 2 - awningDepth / 2;

    // Create striped pattern
    for (let i = 0; i < stripeCount; i++) {
      const isColored = i % 2 === 0;
      const stripeMaterial = createToonMaterial({
        color: isColored ? color : 0xFFFFFF
      });

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(stripeWidth, 0.1, awningDepth),
        stripeMaterial
      );
      stripe.position.set(
        (i - (stripeCount - 1) / 2) * stripeWidth,
        0,
        0
      );
      awningGroup.add(stripe);
    }

    // Awning front edge (angled down)
    const frontEdgeMaterial = createToonMaterial({ color: color });
    const frontEdge = new THREE.Mesh(
      new THREE.BoxGeometry(awningWidth, 0.3, 0.1),
      frontEdgeMaterial
    );
    const edgeZ = depth > 0 ? awningDepth / 2 - 0.05 : -awningDepth / 2 + 0.05;
    frontEdge.position.set(0, -0.15, edgeZ);
    awningGroup.add(frontEdge);

    // Neon edge (glows at night)
    const neonEdgeMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0,
    });
    const neonEdge = new THREE.Mesh(
      new THREE.BoxGeometry(awningWidth + 0.2, 0.1, 0.05),
      neonEdgeMaterial
    );
    neonEdge.position.set(0, -0.25, edgeZ + (depth > 0 ? 0.05 : -0.05));
    awningGroup.add(neonEdge);
    this.neonSigns.push({ mesh: neonEdge, color: color, type: 'edge' });

    awningGroup.position.set(0, awningY, awningZ);
    group.add(awningGroup);
  }

  addDisplayWindow(group, width, depth, type) {
    const frameMaterial = createToonMaterial({ color: 0x2A2A2A });
    const glassMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.3,
    });

    const windowWidth = width * 0.7;
    const windowHeight = 2.5;
    const windowZ = depth > 0 ? depth / 2 + 0.02 : depth / 2 - 0.02;

    // Window frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + 0.3, windowHeight + 0.3, 0.1),
      frameMaterial
    );
    frame.position.set(0, 1.8, windowZ);
    if (depth < 0) frame.rotation.y = Math.PI;
    group.add(frame);

    // Glass
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, windowHeight, 0.05),
      glassMaterial
    );
    glass.position.set(0, 1.8, windowZ + (depth > 0 ? 0.05 : -0.05));
    if (depth < 0) glass.rotation.y = Math.PI;
    group.add(glass);
    this.windowMeshes.push(glass);

    // Interior display items based on type
    if (type === 'records') {
      this.addRecordDisplay(group, windowZ, depth);
    } else if (type === 'coffee') {
      this.addCoffeeDisplay(group, windowZ, depth);
    }
  }

  addRecordDisplay(group, windowZ, depth) {
    const recordMaterial = createToonMaterial({ color: 0x1A1A1A });

    // Vinyl records displayed in window
    for (let i = 0; i < 3; i++) {
      const record = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.02, 16),
        recordMaterial
      );
      record.rotation.x = Math.PI / 6;
      record.rotation.z = Math.random() * 0.2 - 0.1;
      record.position.set(
        (i - 1) * 1,
        1.2 + i * 0.2,
        windowZ - (depth > 0 ? 0.5 : -0.5)
      );
      group.add(record);

      // Record label (center)
      const labelMaterial = createToonMaterial({
        color: [0xFF6B35, 0x00BFFF, 0xFF1493][i]
      });
      const label = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.025, 16),
        labelMaterial
      );
      label.rotation.x = Math.PI / 6;
      label.rotation.z = record.rotation.z;
      label.position.copy(record.position);
      label.position.y += 0.01;
      group.add(label);
    }
  }

  addCoffeeDisplay(group, windowZ, depth) {
    // Coffee cup display
    const cupMaterial = createToonMaterial({ color: 0xF5F5DC });
    const coffeeMaterial = createToonMaterial({ color: 0x4A2C2A });

    for (let i = 0; i < 2; i++) {
      // Cup
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 0.25, 12),
        cupMaterial
      );
      cup.position.set((i - 0.5) * 0.8, 1.2, windowZ - (depth > 0 ? 0.5 : -0.5));
      group.add(cup);

      // Coffee surface
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12),
        coffeeMaterial
      );
      coffee.position.copy(cup.position);
      coffee.position.y += 0.1;
      group.add(coffee);

      // Handle
      const handleMaterial = createToonMaterial({ color: 0xF5F5DC });
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.02, 8, 12, Math.PI),
        handleMaterial
      );
      handle.rotation.y = Math.PI / 2;
      handle.position.set(cup.position.x + 0.12, cup.position.y, cup.position.z);
      group.add(handle);
    }
  }

  addNeonTubeSign(group, x, y, z, text, color) {
    const signWidth = 5;
    const signHeight = 1;

    // Background panel
    const bgMaterial = createToonMaterial({ color: 0x1A1A2E });
    const bg = new THREE.Mesh(
      new THREE.BoxGeometry(signWidth + 0.4, signHeight + 0.2, 0.15),
      bgMaterial
    );
    bg.position.set(x, y, z + 0.1);
    group.add(bg);

    // Neon tube effect (glowing box)
    const neonMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
    });
    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(signWidth, signHeight * 0.6, 0.08),
      neonMaterial
    );
    neon.position.set(x, y, z + 0.18);
    group.add(neon);
    this.neonSigns.push({ mesh: neon, color: color, type: 'sign' });

    // Point light for glow
    const pointLight = new THREE.PointLight(color, 0, 8);
    pointLight.position.set(x, y, z + 0.5);
    group.add(pointLight);
    this.lights.push({ light: pointLight, mesh: neon, color: color, type: 'neon' });
  }

  addCoffeeCupSign(group, x, y, z) {
    // Decorative coffee cup neon sign
    const cupMaterial = new THREE.MeshBasicMaterial({
      color: NEON_COLORS.orange,
      transparent: true,
      opacity: 0.9,
    });

    // Cup body (cylinder)
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.4, 1, 12),
      cupMaterial
    );
    cup.position.set(x + 3, y, z - 0.1);
    group.add(cup);
    this.neonSigns.push({ mesh: cup, color: NEON_COLORS.orange, type: 'icon' });

    // Steam wisps
    const steamMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.5,
    });
    for (let i = 0; i < 3; i++) {
      const steam = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.4 + i * 0.1, 0.05),
        steamMaterial.clone()
      );
      steam.position.set(x + 2.7 + i * 0.2, y + 0.8 + i * 0.15, z - 0.1);
      group.add(steam);
      this.animatedElements.push({ mesh: steam, type: 'steam', offset: i * 0.5 });
    }
  }

  addCafeFurniture(group, depth) {
    const tableMaterial = createToonMaterial({ color: 0x5D4037 });
    const chairMaterial = createToonMaterial({ color: 0x2A2A2A });
    const umbrellaFabric = createToonMaterial({ color: 0xB22222 });

    // Two outdoor tables with chairs
    const tables = [
      { x: -2, z: -depth / 2 - 3 },
      { x: 2, z: -depth / 2 - 3 },
    ];

    tables.forEach((pos, i) => {
      // Table
      const tableTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.05, 12),
        tableMaterial
      );
      tableTop.position.set(pos.x, 0.75, pos.z);
      tableTop.castShadow = true;
      group.add(tableTop);

      // Table leg
      const tableLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.75, 8),
        tableMaterial
      );
      tableLeg.position.set(pos.x, 0.375, pos.z);
      group.add(tableLeg);

      // Chairs (2 per table)
      [-0.8, 0.8].forEach((chairOffset, j) => {
        // Chair seat
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.05, 0.4),
          chairMaterial
        );
        seat.position.set(pos.x + chairOffset, 0.45, pos.z);
        group.add(seat);

        // Chair back
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.4, 0.05),
          chairMaterial
        );
        back.position.set(pos.x + chairOffset, 0.67, pos.z + 0.2);
        group.add(back);

        // Chair legs
        for (let lx = -1; lx <= 1; lx += 2) {
          for (let lz = -1; lz <= 1; lz += 2) {
            const leg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6),
              chairMaterial
            );
            leg.position.set(
              pos.x + chairOffset + lx * 0.15,
              0.225,
              pos.z + lz * 0.15
            );
            group.add(leg);
          }
        }
      });

      // Umbrella (only on first table)
      if (i === 0) {
        // Pole
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 2, 8),
          chairMaterial
        );
        pole.position.set(pos.x, 1.75, pos.z);
        group.add(pole);

        // Canopy
        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(1, 0.5, 8),
          umbrellaFabric
        );
        canopy.position.set(pos.x, 2.5, pos.z);
        canopy.rotation.x = Math.PI;
        canopy.castShadow = true;
        group.add(canopy);
      }
    });
  }

  addSandwichBoard(group, x, z) {
    const woodMaterial = createToonMaterial({ color: 0x5D4037 });
    const boardMaterial = createToonMaterial({ color: 0x2F4F4F });

    // A-frame structure
    const boardWidth = 0.8;
    const boardHeight = 1.2;
    const angle = Math.PI / 8;

    // Left and right panels
    [-1, 1].forEach(side => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth, boardHeight, 0.05),
        boardMaterial
      );
      panel.rotation.x = side * angle;
      panel.position.set(x, boardHeight / 2 + 0.1, z + side * 0.3);
      panel.castShadow = true;
      group.add(panel);

      // Wood frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth + 0.1, boardHeight + 0.1, 0.03),
        woodMaterial
      );
      frame.rotation.x = side * angle;
      frame.position.set(x, boardHeight / 2 + 0.1, z + side * 0.32);
      group.add(frame);
    });

    // Top hinge
    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.1),
      woodMaterial
    );
    hinge.position.set(x, boardHeight + 0.2, z);
    group.add(hinge);
  }

  // ================================================================
  // OTHER BUILDING METHODS (Legacy enhanced)
  // ================================================================

  addWindows(building, width, height, depth) {
    const windowMaterialDay = createToonMaterial({ color: 0x87CEEB });
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

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const wx = startX + col * (windowSize + windowGap);
        const wy = startY - row * (windowSize + windowGap) - building.position.y + height / 2;

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

        const frontGlow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterialNight.clone()
        );
        frontGlow.position.copy(frontWindow.position);
        frontGlow.position.z += 0.01;
        this.scene.add(frontGlow);
        this.meshes.push(frontGlow);
        this.windowMeshes.push(frontGlow);

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
    const awningMaterial = createToonMaterial({ color: color || 0xB22222 });
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1, 0.3, 2),
      awningMaterial
    );
    awning.position.set(x, building.position.y, z - 5);
    this.scene.add(awning);
    this.meshes.push(awning);

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

  addNeonSign(x, y, z, text, color, rotation = 0, large = false) {
    const signWidth = large ? 8 : 4;
    const signHeight = large ? 1.5 : 0.8;

    const bgMaterial = createToonMaterial({ color: 0x1A1A2E });
    const bg = new THREE.Mesh(
      new THREE.BoxGeometry(signWidth + 0.4, signHeight + 0.2, 0.1),
      bgMaterial
    );
    bg.position.set(x, y, z);
    bg.rotation.y = rotation;
    this.scene.add(bg);
    this.meshes.push(bg);

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

    const pointLight = new THREE.PointLight(color, 0, 8);
    pointLight.position.set(x, y, z + (rotation === 0 ? -0.5 : 0.5));
    this.scene.add(pointLight);
    this.lights.push({ light: pointLight, mesh: neon, color: color, type: 'neon' });
  }

  addRooftopAntenna(x, y, z) {
    const antennaMaterial = createToonMaterial({ color: 0x2A2A2A });

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, 5, 8),
      antennaMaterial
    );
    pole.position.set(x, y + 2.5, z);
    this.scene.add(pole);
    this.meshes.push(pole);

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
    const colors = [0x6B4423, 0x4A4A4A, 0x8B7355, 0x5C4033];

    this.createSimpleBuilding(15, -20, 6, 10, 6, colors[0]);
    this.createSimpleBuilding(15, 20, 6, 8, 6, colors[1]);
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

    this.addWindows(building, width, height, depth);
  }

  // ================================================================
  // PHASE 2: STREET PROPS DENSITY
  // ================================================================
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

    // NEW: Traffic elements
    this.createTrafficLight(6, -28);
    this.createTrafficLight(-6, 28);

    // NEW: Parking meters
    this.createParkingMeter(7.5, -8);
    this.createParkingMeter(7.5, 8);
    this.createParkingMeter(-7.5, -3);
    this.createParkingMeter(-7.5, 12);

    // NEW: Street signs
    this.createStreetSign(8, -20, 'BROADWAY');
    this.createStreetSign(-8, 20, 'MAIN ST');

    // NEW: NYC Taxi (parked)
    this.createNYCTaxi(3, 12);
    this.createNYCTaxi(-3, -18);

    // NEW: Hot dog cart
    this.createHotDogCart(-8.5, -12);

    // NEW: Mailbox
    this.createMailbox(8, 5);
    this.createMailbox(-8, -8);

    // NEW: Manhole covers
    this.createManholeCover(0, -10);
    this.createManholeCover(0, 10);
    this.createManholeCover(0, 0);

    // NEW: Street trees
    this.createStreetTree(9, -25);
    this.createStreetTree(9, 25);
    this.createStreetTree(-9, -25);
    this.createStreetTree(-9, 25);

    // NEW: Planters
    this.createPlanter(9, -2);
    this.createPlanter(-9, 8);
  }

  createStreetLight(x, z) {
    const poleMaterial = createToonMaterial({ color: 0x2A2A2A });
    const poleHeight = 5;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, poleHeight, 8),
      poleMaterial
    );
    pole.position.set(x, poleHeight / 2, z);
    pole.castShadow = true;
    this.scene.add(pole);
    this.meshes.push(pole);

    // Curved arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.1),
      poleMaterial
    );
    arm.position.set(x + 0.75, poleHeight - 0.2, z);
    this.scene.add(arm);
    this.meshes.push(arm);

    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.4),
      poleMaterial
    );
    fixture.position.set(x + 1.3, poleHeight - 0.5, z);
    this.scene.add(fixture);
    this.meshes.push(fixture);

    const bulbMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFE4B5,
      transparent: true,
      opacity: 0,
    });
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      bulbMaterial
    );
    bulb.position.set(x + 1.3, poleHeight - 0.7, z);
    this.scene.add(bulb);
    this.lights.push({ mesh: bulb, position: new THREE.Vector3(x + 1.3, poleHeight - 0.7, z) });

    const pointLight = new THREE.PointLight(0xFFE4B5, 0, 15);
    pointLight.position.set(x + 1.3, poleHeight - 0.7, z);
    this.scene.add(pointLight);
    this.lights.push({ light: pointLight, mesh: bulb, type: 'streetlight' });
  }

  createFireHydrant(x, z) {
    const material = createToonMaterial({ color: 0xCC0000 });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8),
      material
    );
    body.position.set(x, 0.3, z);
    body.castShadow = true;
    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 0.2, 8),
      material
    );
    top.position.set(x, 0.7, z);
    this.scene.add(top);
    this.meshes.push(top);

    // Side outlets
    [-1, 1].forEach(side => {
      const outlet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.15, 6),
        material
      );
      outlet.rotation.z = Math.PI / 2;
      outlet.position.set(x + side * 0.25, 0.4, z);
      this.scene.add(outlet);
      this.meshes.push(outlet);
    });
  }

  createBench(x, z) {
    const woodMaterial = createToonMaterial({ color: 0x8B4513 });
    const metalMaterial = createToonMaterial({ color: 0x2A2A2A });

    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      woodMaterial
    );
    seat.position.set(x, 0.5, z);
    seat.castShadow = true;
    this.scene.add(seat);
    this.meshes.push(seat);
    this.collisionMeshes.push(seat);

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 0.1),
      woodMaterial
    );
    back.position.set(x, 0.8, z + 0.2);
    back.castShadow = true;
    this.scene.add(back);
    this.meshes.push(back);

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
    const material = createToonMaterial({ color: 0x228B22 });

    const can = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8),
      material
    );
    can.position.set(x, 0.4, z);
    can.castShadow = true;
    this.scene.add(can);
    this.meshes.push(can);
    this.collisionMeshes.push(can);

    // Lid
    const lidMaterial = createToonMaterial({ color: 0x1A5A1A });
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.25, 0.1, 8),
      lidMaterial
    );
    lid.position.set(x, 0.85, z);
    this.scene.add(lid);
    this.meshes.push(lid);
  }

  // NEW STREET PROPS
  createTrafficLight(x, z) {
    const poleMaterial = createToonMaterial({ color: 0x3D3D3D });
    const houseMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 4, 8),
      poleMaterial
    );
    pole.position.set(x, 2, z);
    pole.castShadow = true;
    this.scene.add(pole);
    this.meshes.push(pole);

    // Arm extending over street
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 4, 8),
      poleMaterial
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(x < 0 ? x + 2 : x - 2, 4, z);
    this.scene.add(arm);
    this.meshes.push(arm);

    // Traffic light housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1, 0.3),
      houseMaterial
    );
    housing.position.set(x < 0 ? x + 3.5 : x - 3.5, 3.8, z);
    housing.castShadow = true;
    this.scene.add(housing);
    this.meshes.push(housing);

    // Lights (red, yellow, green)
    const colors = [0xFF0000, 0xFFFF00, 0x00FF00];
    colors.forEach((color, i) => {
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: i === 2 ? 0.9 : 0.3, // Green is on
      });
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        lightMaterial
      );
      light.position.set(
        x < 0 ? x + 3.5 : x - 3.5,
        4.1 - i * 0.3,
        z + 0.18
      );
      this.scene.add(light);
      this.meshes.push(light);
    });
  }

  createParkingMeter(x, z) {
    const poleMaterial = createToonMaterial({ color: 0x4A4A4A });
    const headMaterial = createToonMaterial({ color: 0x2A2A2A });

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8),
      poleMaterial
    );
    pole.position.set(x, 0.6, z);
    pole.castShadow = true;
    this.scene.add(pole);
    this.meshes.push(pole);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.25, 0.15),
      headMaterial
    );
    head.position.set(x, 1.3, z);
    this.scene.add(head);
    this.meshes.push(head);

    // Display window
    const displayMaterial = createToonMaterial({ color: 0xCCCCCC });
    const display = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.02),
      displayMaterial
    );
    display.position.set(x, 1.35, z + 0.08);
    this.scene.add(display);
    this.meshes.push(display);
  }

  createStreetSign(x, z, text) {
    const poleMaterial = createToonMaterial({ color: 0x2A5A2A });
    const signMaterial = createToonMaterial({ color: 0x2A5A2A });

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 3, 8),
      poleMaterial
    );
    pole.position.set(x, 1.5, z);
    pole.castShadow = true;
    this.scene.add(pole);
    this.meshes.push(pole);

    // Sign plate
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.4, 0.05),
      signMaterial
    );
    sign.position.set(x, 3, z);
    sign.rotation.y = Math.PI / 4;
    this.scene.add(sign);
    this.meshes.push(sign);

    // White text background
    const textBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.3, 0.02),
      createToonMaterial({ color: 0xFFFFFF })
    );
    textBg.position.set(x, 3, z);
    textBg.rotation.y = Math.PI / 4;
    textBg.position.x += Math.cos(Math.PI / 4) * 0.03;
    textBg.position.z += Math.sin(Math.PI / 4) * 0.03;
    this.scene.add(textBg);
    this.meshes.push(textBg);
  }

  createNYCTaxi(x, z) {
    const yellowMaterial = createToonMaterial({ color: 0xFFD700 });
    const blackMaterial = createToonMaterial({ color: 0x1A1A1A });
    const chromeMaterial = createToonMaterial({ color: 0xC0C0C0 });
    const glassMaterial = createToonMaterial({ color: 0x87CEEB });

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.8, 4),
      yellowMaterial
    );
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 2),
      yellowMaterial
    );
    cabin.position.set(0, 1.1, 0.3);
    cabin.castShadow = true;
    group.add(cabin);

    // Windows
    const frontWindow = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 0.05),
      glassMaterial
    );
    frontWindow.position.set(0, 1.15, 1.32);
    group.add(frontWindow);

    const rearWindow = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 0.05),
      glassMaterial
    );
    rearWindow.position.set(0, 1.15, -0.72);
    group.add(rearWindow);

    // Wheels
    const wheelPositions = [
      { x: 0.85, z: 1.2 },
      { x: -0.85, z: 1.2 },
      { x: 0.85, z: -1.2 },
      { x: -0.85, z: -1.2 },
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12),
        blackMaterial
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.35, pos.z);
      group.add(wheel);

      // Hub cap
      const hubcap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.22, 8),
        chromeMaterial
      );
      hubcap.rotation.z = Math.PI / 2;
      hubcap.position.copy(wheel.position);
      group.add(hubcap);
    });

    // Taxi sign on top
    const taxiSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.25, 0.3),
      createToonMaterial({ color: 0xFFFFFF })
    );
    taxiSign.position.set(0, 1.55, 0.3);
    group.add(taxiSign);

    // Headlights
    [-0.6, 0.6].forEach(side => {
      const headlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        chromeMaterial
      );
      headlight.position.set(side, 0.5, 2);
      group.add(headlight);
    });

    // Rotate taxi to face street
    group.rotation.y = Math.PI / 2;

    this.scene.add(group);
    this.meshes.push(group);

    // Add collision for taxi body
    const collisionBox = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1.5, 2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collisionBox.position.set(x, 0.75, z);
    collisionBox.rotation.y = Math.PI / 2;
    this.collisionMeshes.push(collisionBox);
  }

  createHotDogCart(x, z) {
    const cartMaterial = createToonMaterial({ color: 0xC0C0C0 });
    const redMaterial = createToonMaterial({ color: 0xCC0000 });
    const umbrellaColor = createToonMaterial({ color: 0xFFD700 });

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Cart body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.8, 0.8),
      cartMaterial
    );
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Red side panels
    [-0.76, 0.76].forEach(side => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.6, 0.7),
        redMaterial
      );
      panel.position.set(side, 1.05, 0);
      group.add(panel);
    });

    // Wheels
    [-0.55, 0.55].forEach(side => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12),
        createToonMaterial({ color: 0x2A2A2A })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side, 0.25, 0);
      group.add(wheel);
    });

    // Umbrella pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2, 8),
      createToonMaterial({ color: 0x3D3D3D })
    );
    pole.position.set(0, 2, 0);
    group.add(pole);

    // Umbrella
    const umbrella = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 0.6, 8),
      umbrellaColor
    );
    umbrella.position.set(0, 2.8, 0);
    umbrella.rotation.x = Math.PI;
    umbrella.castShadow = true;
    group.add(umbrella);

    this.scene.add(group);
    this.meshes.push(group);
    this.collisionMeshes.push(body);
  }

  createMailbox(x, z) {
    const blueMaterial = createToonMaterial({ color: 0x0047AB });

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1, 0.4),
      blueMaterial
    );
    body.position.set(x, 0.5, z);
    body.castShadow = true;
    this.scene.add(body);
    this.meshes.push(body);
    this.collisionMeshes.push(body);

    // Rounded top
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8, 1, false, 0, Math.PI),
      blueMaterial
    );
    top.rotation.z = Math.PI / 2;
    top.rotation.y = Math.PI / 2;
    top.position.set(x, 1.1, z);
    this.scene.add(top);
    this.meshes.push(top);

    // Mail slot
    const slotMaterial = createToonMaterial({ color: 0x003380 });
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.08, 0.02),
      slotMaterial
    );
    slot.position.set(x, 0.8, z + 0.21);
    this.scene.add(slot);
    this.meshes.push(slot);
  }

  createManholeCover(x, z) {
    const metalMaterial = createToonMaterial({ color: 0x4A4A4A });

    const cover = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16),
      metalMaterial
    );
    cover.position.set(x, 0.03, z);
    cover.rotation.x = -Math.PI / 2;
    this.scene.add(cover);
    this.meshes.push(cover);

    // Pattern on cover (concentric circles)
    for (let i = 1; i <= 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(i * 0.12, i * 0.12 + 0.02, 16),
        createToonMaterial({ color: 0x3A3A3A })
      );
      ring.position.set(x, 0.04, z);
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      this.meshes.push(ring);
    }
  }

  createStreetTree(x, z) {
    const trunkMaterial = createToonMaterial({ color: 0x5D4037 });
    const leafMaterial = createToonMaterial({ color: 0x228B22 });
    const grateMaterial = createToonMaterial({ color: 0x3A3A3A });

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Tree grate
    const grate = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.05, 1.5),
      grateMaterial
    );
    grate.position.y = 0.025;
    group.add(grate);

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 2, 8),
      trunkMaterial
    );
    trunk.position.y = 1;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage (multiple spheres for fuller look)
    const foliagePositions = [
      { y: 2.8, scale: 1.3 },
      { y: 3.3, scale: 1.0 },
      { y: 2.5, scale: 1.0, x: 0.5 },
      { y: 2.5, scale: 1.0, x: -0.5 },
      { y: 2.6, scale: 0.9, z: 0.4 },
      { y: 2.6, scale: 0.9, z: -0.4 },
    ];

    foliagePositions.forEach(pos => {
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        leafMaterial
      );
      foliage.scale.setScalar(pos.scale);
      foliage.position.set(pos.x || 0, pos.y, pos.z || 0);
      foliage.castShadow = true;
      group.add(foliage);
    });

    this.scene.add(group);
    this.meshes.push(group);

    // Collision for trunk
    const trunkCollision = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 2, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    trunkCollision.position.set(x, 1, z);
    this.collisionMeshes.push(trunkCollision);
  }

  createPlanter(x, z) {
    const concreteMaterial = createToonMaterial({ color: 0x808080 });
    const soilMaterial = createToonMaterial({ color: 0x4A3728 });
    const flowerMaterial = createToonMaterial({ color: 0xFF69B4 });
    const greenMaterial = createToonMaterial({ color: 0x228B22 });

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Concrete planter box
    const planter = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 1.2),
      concreteMaterial
    );
    planter.position.y = 0.3;
    planter.castShadow = true;
    group.add(planter);

    // Soil
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.1, 1),
      soilMaterial
    );
    soil.position.y = 0.55;
    group.add(soil);

    // Greenery
    const greenery = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      greenMaterial
    );
    greenery.scale.set(1.5, 0.6, 1.5);
    greenery.position.y = 0.8;
    group.add(greenery);

    // Flowers
    for (let i = 0; i < 5; i++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        flowerMaterial
      );
      const angle = (i / 5) * Math.PI * 2;
      flower.position.set(
        Math.cos(angle) * 0.3,
        1,
        Math.sin(angle) * 0.3
      );
      group.add(flower);
    }

    this.scene.add(group);
    this.meshes.push(group);
    this.collisionMeshes.push(planter);
  }

  createBoundaryWalls() {
    const wallMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });

    const wallHeight = 10;
    const worldSize = 50;

    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(worldSize * 2, wallHeight, 1),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -worldSize);
    this.scene.add(northWall);
    this.collisionMeshes.push(northWall);

    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(worldSize * 2, wallHeight, 1),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, worldSize);
    this.scene.add(southWall);
    this.collisionMeshes.push(southWall);

    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, worldSize * 2),
      wallMaterial
    );
    eastWall.position.set(worldSize, wallHeight / 2, 0);
    this.scene.add(eastWall);
    this.collisionMeshes.push(eastWall);

    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, worldSize * 2),
      wallMaterial
    );
    westWall.position.set(-worldSize, wallHeight / 2, 0);
    this.scene.add(westWall);
    this.collisionMeshes.push(westWall);
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;

    this.lights.forEach(({ light, mesh, type, color }) => {
      if (type === 'streetlight' && light) {
        light.intensity = time * 2;
        if (mesh && mesh.material) {
          mesh.material.opacity = time;
        }
      } else if (type === 'neon' && light) {
        light.intensity = 0.5 + time * 1.5;
      }
    });

    this.neonSigns.forEach(({ mesh, color, type, blinking }) => {
      if (mesh && mesh.material) {
        if (type === 'beacon' && blinking) {
          return;
        }

        if (type === 'led') {
          mesh.material.opacity = time * 0.8;
        } else if (type === 'sign' || type === 'icon') {
          const baseOpacity = 0.7;
          mesh.material.opacity = baseOpacity + time * 0.3;
        } else if (type === 'edge') {
          mesh.material.opacity = time * 0.6;
        }

        if (mesh.material.emissive) {
          mesh.material.emissiveIntensity = time * 0.5;
        }
      }
    });

    this.windowMeshes.forEach((mesh) => {
      if (mesh.material && mesh.material.transparent) {
        mesh.material.opacity = 0.3 + time * 0.4;
      }
    });
  }

  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  update(deltaTime) {
    const time = Date.now() * 0.001;

    // Animate blinking beacon
    this.neonSigns.forEach(({ mesh, blinking }) => {
      if (blinking && mesh && mesh.material) {
        const blink = Math.sin(time * 5) > 0;
        mesh.material.opacity = blink ? 1 : 0.3;
      }
    });

    // Animate steam from coffee cup
    this.animatedElements.forEach(({ mesh, type, offset }) => {
      if (type === 'steam' && mesh) {
        mesh.position.y += Math.sin(time * 2 + offset) * 0.002;
        mesh.material.opacity = 0.3 + Math.sin(time * 3 + offset) * 0.2;
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
    this.animatedElements = [];
  }
}
