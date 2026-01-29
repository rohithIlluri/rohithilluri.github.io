/**
 * MachiyaBuilder.js - Japanese Machiya (Townhouse) Building Generator
 * Creates procedural traditional Japanese wooden townhouses
 *
 * Machiya Characteristics:
 * - Narrow frontage (3-5 units) facing street ("unagi no nedoko" - eel's bed)
 * - Deep interior (8-15 units) extending back
 * - 2-3 stories tall
 * - Koshi (wooden lattice) windows
 * - Flat (ichimonji) or curved tile roofs
 * - Noren (fabric curtain) at entrances
 */

import * as THREE from 'three';
import {
  createToonMaterial,
  createEnhancedToonMaterial,
  createOutlineMesh,
} from '../shaders/toon.js';
import { MACHIYA_COLORS, MACHIYA_PRESETS } from '../constants/colors.js';

// Building dimension ranges
const MACHIYA_CONFIG = {
  // Frontage (width facing street)
  WIDTH_MIN: 3,
  WIDTH_MAX: 5,
  // Depth (extending back from street)
  DEPTH_MIN: 6,
  DEPTH_MAX: 12,
  // Height
  STORY_HEIGHT: 3.0,
  STORIES_MIN: 2,
  STORIES_MAX: 3,
  // Roof
  ROOF_OVERHANG: 0.4,
  ROOF_HEIGHT: 0.8,
  // Details
  LATTICE_SPACING: 0.12,
  WINDOW_INSET: 0.1,
};

export class MachiyaBuilder {
  constructor(planet, scene, lightDirection) {
    this.planet = planet;
    this.scene = scene;
    this.lightDirection = lightDirection || new THREE.Vector3(1, 1, 1).normalize();

    // Generated buildings
    this.buildings = [];
    this.meshes = [];
    this.collisionMeshes = [];
  }

  /**
   * Set the light direction for toon materials
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  /**
   * Create a machiya building at the specified position
   * @param {Object} config - Building configuration
   */
  createMachiya(config) {
    const {
      lat,
      lon,
      width = this.randomRange(MACHIYA_CONFIG.WIDTH_MIN, MACHIYA_CONFIG.WIDTH_MAX),
      depth = this.randomRange(MACHIYA_CONFIG.DEPTH_MIN, MACHIYA_CONFIG.DEPTH_MAX),
      stories = Math.floor(this.randomRange(MACHIYA_CONFIG.STORIES_MIN, MACHIYA_CONFIG.STORIES_MAX + 0.99)),
      preset = this.getRandomPreset(),
      facingAngle = 0, // Rotation around up axis (radians)
      variation = Math.random(), // 0-1 for detail variation
    } = config;

    const height = stories * MACHIYA_CONFIG.STORY_HEIGHT;

    // Get surface position and orientation
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos, facingAngle);

    // Create building group
    const buildingGroup = new THREE.Group();

    // Get colors from preset
    const colors = MACHIYA_PRESETS[preset] || MACHIYA_PRESETS.SHOP;

    // Create main structure
    this.createMainStructure(buildingGroup, width, height, depth, colors);

    // Add foundation
    this.createFoundation(buildingGroup, width, height, depth);

    // Add roof
    this.createRoof(buildingGroup, width, height, depth, colors, stories);

    // Add windows and lattice for each story
    for (let story = 0; story < stories; story++) {
      if (story === 0) {
        // Ground floor shop front
        this.createShopFront(buildingGroup, width, height, depth, colors, variation);
      } else {
        // Upper floor windows with koshi lattice
        this.createUpperFloorWindows(buildingGroup, width, height, depth, story, stories, colors);
      }
    }

    // Add side windows
    this.createSideWindows(buildingGroup, width, height, depth, stories, colors);

    // Add noren curtain at entrance (50% chance)
    if (variation > 0.5) {
      this.createNoren(buildingGroup, width, height, depth, colors);
    }

    // Add decorative details
    this.addDetails(buildingGroup, width, height, depth, colors, variation);

    // Position building on planet surface
    const buildingPos = surfacePos.clone().add(up.clone().multiplyScalar(height / 2));
    buildingGroup.position.copy(buildingPos);
    buildingGroup.quaternion.copy(orientation);

    this.scene.add(buildingGroup);
    this.buildings.push({
      group: buildingGroup,
      lat,
      lon,
      width,
      depth,
      height,
      stories,
      preset,
    });

    // Create collision mesh
    const collisionGeo = new THREE.BoxGeometry(width, height, depth);
    const collisionMesh = new THREE.Mesh(collisionGeo);
    collisionMesh.position.copy(buildingPos);
    collisionMesh.quaternion.copy(orientation);
    collisionMesh.visible = false;
    this.collisionMeshes.push(collisionMesh);

    return buildingGroup;
  }

  /**
   * Create the main building structure
   */
  createMainStructure(group, width, height, depth, colors) {
    const wallMat = createEnhancedToonMaterial({
      color: colors.wall,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, wallMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    this.meshes.push(body);

    // Add outline
    const outline = createOutlineMesh(body, 0.08);
    group.add(outline);
    this.meshes.push(outline);
  }

  /**
   * Create stone foundation
   */
  createFoundation(group, width, height, depth) {
    const foundationHeight = 0.3;
    const foundationMat = createToonMaterial({ color: MACHIYA_COLORS.STONE_BASE });

    const foundationGeo = new THREE.BoxGeometry(width + 0.1, foundationHeight, depth + 0.1);
    const foundation = new THREE.Mesh(foundationGeo, foundationMat);
    foundation.position.y = -height / 2 + foundationHeight / 2;
    foundation.castShadow = true;
    group.add(foundation);
    this.meshes.push(foundation);

    // Foundation outline
    const outline = createOutlineMesh(foundation, 0.06);
    outline.position.copy(foundation.position);
    group.add(outline);
    this.meshes.push(outline);
  }

  /**
   * Create traditional tile roof
   */
  createRoof(group, width, height, depth, colors, stories) {
    const roofMat = createEnhancedToonMaterial({
      color: colors.roof,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    const overhang = MACHIYA_CONFIG.ROOF_OVERHANG;
    const roofHeight = MACHIYA_CONFIG.ROOF_HEIGHT;

    // Main roof (slightly sloped flat style - ichimonji)
    const roofWidth = width + overhang * 2;
    const roofDepth = depth + overhang * 2;

    // Roof base
    const roofGeo = new THREE.BoxGeometry(roofWidth, roofHeight * 0.3, roofDepth);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height / 2 + roofHeight * 0.15;
    roof.castShadow = true;
    group.add(roof);
    this.meshes.push(roof);

    // Roof tiles (front slope)
    const tileGeo = new THREE.BoxGeometry(roofWidth, roofHeight * 0.2, roofDepth * 0.6);
    const frontTiles = new THREE.Mesh(tileGeo, roofMat);
    frontTiles.position.set(0, height / 2 + roofHeight * 0.4, roofDepth * 0.15);
    frontTiles.rotation.x = 0.15; // Slight forward tilt
    frontTiles.castShadow = true;
    group.add(frontTiles);
    this.meshes.push(frontTiles);

    // Roof outline
    const roofOutline = createOutlineMesh(roof, 0.06);
    roofOutline.position.copy(roof.position);
    group.add(roofOutline);
    this.meshes.push(roofOutline);

    // Add eaves trim
    const trimMat = createToonMaterial({ color: colors.trim });
    const trimGeo = new THREE.BoxGeometry(roofWidth + 0.1, 0.08, 0.15);

    // Front eave
    const frontEave = new THREE.Mesh(trimGeo, trimMat);
    frontEave.position.set(0, height / 2 + 0.05, depth / 2 + overhang);
    group.add(frontEave);
    this.meshes.push(frontEave);

    // Back eave
    const backEave = new THREE.Mesh(trimGeo, trimMat);
    backEave.position.set(0, height / 2 + 0.05, -depth / 2 - overhang);
    group.add(backEave);
    this.meshes.push(backEave);
  }

  /**
   * Create ground floor shop front
   */
  createShopFront(group, width, height, depth, colors, variation) {
    const floorHeight = MACHIYA_CONFIG.STORY_HEIGHT;
    const floorY = -height / 2 + floorHeight / 2;

    const frameMat = createToonMaterial({ color: colors.lattice });
    const glassMat = createToonMaterial({ color: 0x87CEEB });
    const doorMat = createToonMaterial({ color: MACHIYA_COLORS.WOOD_DARK });

    // Shop opening (recessed area)
    const openingWidth = width * 0.8;
    const openingHeight = floorHeight * 0.75;
    const recessDepth = 0.3;

    const recessMat = createToonMaterial({ color: 0x2A2A2A });
    const recessGeo = new THREE.BoxGeometry(openingWidth, openingHeight, recessDepth);
    const recess = new THREE.Mesh(recessGeo, recessMat);
    recess.position.set(0, floorY - 0.2, depth / 2 - recessDepth / 2);
    group.add(recess);
    this.meshes.push(recess);

    // Sliding door frames (shoji-like)
    const doorWidth = openingWidth / 3;
    const doorHeight = openingHeight * 0.95;

    for (let i = 0; i < 3; i++) {
      const doorX = (i - 1) * doorWidth;

      // Door frame
      const frameGeo = new THREE.BoxGeometry(doorWidth - 0.05, doorHeight, 0.08);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(doorX, floorY - 0.15, depth / 2 + 0.02);
      group.add(frame);
      this.meshes.push(frame);

      // Door panel (paper/glass)
      const panelMat = i === 1 ? glassMat : createToonMaterial({ color: MACHIYA_COLORS.PAPER_SHOJI });
      const panelGeo = new THREE.PlaneGeometry(doorWidth - 0.15, doorHeight - 0.1);
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(doorX, floorY - 0.15, depth / 2 + 0.03);
      group.add(panel);
      this.meshes.push(panel);

      // Add kumiko lattice pattern
      this.addKumikoPattern(group, doorX, floorY - 0.15, depth / 2 + 0.04, doorWidth - 0.2, doorHeight - 0.15, colors.lattice);
    }

    // Shop threshold
    const thresholdMat = createToonMaterial({ color: MACHIYA_COLORS.STONE_DARK });
    const thresholdGeo = new THREE.BoxGeometry(openingWidth + 0.2, 0.1, 0.3);
    const threshold = new THREE.Mesh(thresholdGeo, thresholdMat);
    threshold.position.set(0, -height / 2 + 0.05, depth / 2 + 0.15);
    group.add(threshold);
    this.meshes.push(threshold);

    // Add small awning/hood over entrance
    this.createAwning(group, openingWidth, floorY + openingHeight / 2, depth / 2, colors);
  }

  /**
   * Create kumiko lattice pattern
   */
  addKumikoPattern(group, x, y, z, width, height, color) {
    const latticeMat = createToonMaterial({ color });
    const barThickness = 0.02;

    // Horizontal bars (3)
    const hCount = 3;
    for (let i = 0; i < hCount; i++) {
      const barY = y + (i - (hCount - 1) / 2) * (height / (hCount + 1));
      const hBarGeo = new THREE.BoxGeometry(width, barThickness, barThickness);
      const hBar = new THREE.Mesh(hBarGeo, latticeMat);
      hBar.position.set(x, barY, z);
      group.add(hBar);
      this.meshes.push(hBar);
    }

    // Vertical bars (2)
    const vCount = 2;
    for (let i = 0; i < vCount; i++) {
      const barX = x + (i - (vCount - 1) / 2) * (width / (vCount + 1));
      const vBarGeo = new THREE.BoxGeometry(barThickness, height, barThickness);
      const vBar = new THREE.Mesh(vBarGeo, latticeMat);
      vBar.position.set(barX, y, z);
      group.add(vBar);
      this.meshes.push(vBar);
    }
  }

  /**
   * Create upper floor windows with koshi lattice
   */
  createUpperFloorWindows(group, width, height, depth, story, totalStories, colors) {
    const floorHeight = MACHIYA_CONFIG.STORY_HEIGHT;
    const floorY = -height / 2 + (story + 0.5) * floorHeight;

    const windowWidth = 0.8;
    const windowHeight = floorHeight * 0.55;
    const windowCount = Math.max(2, Math.floor(width / 1.5));

    const windowMat = createToonMaterial({ color: 0x87CEEB });
    const frameMat = createToonMaterial({ color: colors.lattice });
    const recessMat = createToonMaterial({ color: 0x2A2A2A });

    for (let i = 0; i < windowCount; i++) {
      const windowX = (i - (windowCount - 1) / 2) * (width / windowCount);

      // Window recess
      const recessGeo = new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, 0.15);
      const recess = new THREE.Mesh(recessGeo, recessMat);
      recess.position.set(windowX, floorY, depth / 2 - 0.05);
      group.add(recess);
      this.meshes.push(recess);

      // Window glass
      const windowGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
      const windowMesh = new THREE.Mesh(windowGeo, windowMat);
      windowMesh.position.set(windowX, floorY, depth / 2 - 0.08);
      group.add(windowMesh);
      this.meshes.push(windowMesh);

      // Koshi lattice overlay
      this.createKoshiLattice(group, windowX, floorY, depth / 2 + 0.02, windowWidth, windowHeight, colors.lattice);

      // Window frame
      const frameThickness = 0.06;
      this.createWindowFrame(group, windowX, floorY, depth / 2 + 0.03, windowWidth, windowHeight, frameThickness, frameMat);

      // Window sill
      const sillMat = createToonMaterial({ color: colors.trim });
      const sillGeo = new THREE.BoxGeometry(windowWidth + 0.15, 0.06, 0.12);
      const sill = new THREE.Mesh(sillGeo, sillMat);
      sill.position.set(windowX, floorY - windowHeight / 2 - 0.05, depth / 2 + 0.06);
      group.add(sill);
      this.meshes.push(sill);
    }
  }

  /**
   * Create traditional koshi (vertical lattice) pattern
   */
  createKoshiLattice(group, x, y, z, width, height, color) {
    const latticeMat = createToonMaterial({ color });
    const barThickness = 0.025;
    const spacing = MACHIYA_CONFIG.LATTICE_SPACING;

    // Vertical bars
    const barCount = Math.floor(width / spacing);
    for (let i = 0; i <= barCount; i++) {
      const barX = x - width / 2 + i * (width / barCount);
      const barGeo = new THREE.BoxGeometry(barThickness, height, barThickness);
      const bar = new THREE.Mesh(barGeo, latticeMat);
      bar.position.set(barX, y, z);
      group.add(bar);
      this.meshes.push(bar);
    }

    // Horizontal bars (top and bottom frame, plus middle)
    const hBarGeo = new THREE.BoxGeometry(width + barThickness, barThickness, barThickness);

    // Top
    const topBar = new THREE.Mesh(hBarGeo, latticeMat);
    topBar.position.set(x, y + height / 2, z);
    group.add(topBar);
    this.meshes.push(topBar);

    // Bottom
    const bottomBar = new THREE.Mesh(hBarGeo, latticeMat);
    bottomBar.position.set(x, y - height / 2, z);
    group.add(bottomBar);
    this.meshes.push(bottomBar);

    // Middle
    const middleBar = new THREE.Mesh(hBarGeo, latticeMat);
    middleBar.position.set(x, y, z);
    group.add(middleBar);
    this.meshes.push(middleBar);
  }

  /**
   * Create window frame
   */
  createWindowFrame(group, x, y, z, width, height, thickness, material) {
    // Top
    const topGeo = new THREE.BoxGeometry(width + thickness * 2, thickness, thickness);
    const top = new THREE.Mesh(topGeo, material);
    top.position.set(x, y + height / 2 + thickness / 2, z);
    group.add(top);
    this.meshes.push(top);

    // Bottom
    const bottom = new THREE.Mesh(topGeo, material);
    bottom.position.set(x, y - height / 2 - thickness / 2, z);
    group.add(bottom);
    this.meshes.push(bottom);

    // Sides
    const sideGeo = new THREE.BoxGeometry(thickness, height, thickness);
    const left = new THREE.Mesh(sideGeo, material);
    left.position.set(x - width / 2 - thickness / 2, y, z);
    group.add(left);
    this.meshes.push(left);

    const right = new THREE.Mesh(sideGeo, material);
    right.position.set(x + width / 2 + thickness / 2, y, z);
    group.add(right);
    this.meshes.push(right);
  }

  /**
   * Create side windows
   */
  createSideWindows(group, width, height, depth, stories, colors) {
    const windowMat = createToonMaterial({ color: 0x87CEEB });
    const frameMat = createToonMaterial({ color: colors.lattice });

    const windowWidth = 0.6;
    const windowHeight = MACHIYA_CONFIG.STORY_HEIGHT * 0.4;
    const windowsPerSide = Math.max(1, Math.floor(depth / 3));

    for (let story = 1; story < stories; story++) {
      const floorY = -height / 2 + (story + 0.5) * MACHIYA_CONFIG.STORY_HEIGHT;

      for (let i = 0; i < windowsPerSide; i++) {
        const windowZ = (i - (windowsPerSide - 1) / 2) * (depth / (windowsPerSide + 1));

        // Left side
        const leftWindow = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const leftMesh = new THREE.Mesh(leftWindow, windowMat);
        leftMesh.position.set(-width / 2 - 0.02, floorY, windowZ);
        leftMesh.rotation.y = -Math.PI / 2;
        group.add(leftMesh);
        this.meshes.push(leftMesh);

        // Right side
        const rightMesh = new THREE.Mesh(leftWindow.clone(), windowMat);
        rightMesh.position.set(width / 2 + 0.02, floorY, windowZ);
        rightMesh.rotation.y = Math.PI / 2;
        group.add(rightMesh);
        this.meshes.push(rightMesh);
      }
    }
  }

  /**
   * Create awning over shop entrance
   */
  createAwning(group, width, y, z, colors) {
    const awningMat = createEnhancedToonMaterial({
      color: colors.accent,
      isCharacter: false,
      lightDirection: this.lightDirection,
    });

    const awningGeo = new THREE.BoxGeometry(width + 0.2, 0.1, 0.8);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, y + 0.3, z + 0.4);
    awning.rotation.x = -0.1;
    awning.castShadow = true;
    group.add(awning);
    this.meshes.push(awning);

    // Awning outline
    const outline = createOutlineMesh(awning, 0.05);
    outline.position.copy(awning.position);
    outline.rotation.copy(awning.rotation);
    group.add(outline);
    this.meshes.push(outline);
  }

  /**
   * Create noren curtain at entrance
   */
  createNoren(group, width, height, depth, colors) {
    const norenMat = createToonMaterial({ color: colors.accent });

    const norenWidth = width * 0.6;
    const norenHeight = MACHIYA_CONFIG.STORY_HEIGHT * 0.45;
    const y = -height / 2 + MACHIYA_CONFIG.STORY_HEIGHT - norenHeight / 2 - 0.1;

    // Noren panels (split in middle)
    const panelWidth = norenWidth / 2 - 0.1;
    const panelGeo = new THREE.PlaneGeometry(panelWidth, norenHeight);

    // Left panel
    const leftPanel = new THREE.Mesh(panelGeo, norenMat);
    leftPanel.position.set(-panelWidth / 2 - 0.05, y, depth / 2 + 0.1);
    leftPanel.rotation.x = 0.05; // Slight sway
    group.add(leftPanel);
    this.meshes.push(leftPanel);

    // Right panel
    const rightPanel = new THREE.Mesh(panelGeo, norenMat);
    rightPanel.position.set(panelWidth / 2 + 0.05, y, depth / 2 + 0.1);
    rightPanel.rotation.x = -0.05;
    group.add(rightPanel);
    this.meshes.push(rightPanel);

    // Noren rod
    const rodMat = createToonMaterial({ color: MACHIYA_COLORS.WOOD_DARK });
    const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, norenWidth + 0.3, 8);
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(0, y + norenHeight / 2 + 0.05, depth / 2 + 0.08);
    rod.rotation.z = Math.PI / 2;
    group.add(rod);
    this.meshes.push(rod);
  }

  /**
   * Add decorative details to building
   */
  addDetails(group, width, height, depth, colors, variation) {
    // Vertical sign board (Japanese style) - 40% chance
    if (variation > 0.6) {
      this.createVerticalSign(group, width, height, depth, colors);
    }

    // Potted plant at entrance - 30% chance
    if (variation > 0.7) {
      this.createPottedPlant(group, width, height, depth);
    }

    // Lantern - 25% chance
    if (variation > 0.75) {
      this.createLantern(group, width, height, depth);
    }
  }

  /**
   * Create vertical signboard (kanban)
   */
  createVerticalSign(group, width, height, depth, colors) {
    const signMat = createToonMaterial({ color: MACHIYA_COLORS.WOOD_DARK });
    const signWidth = 0.4;
    const signHeight = MACHIYA_CONFIG.STORY_HEIGHT * 0.6;

    const signGeo = new THREE.BoxGeometry(signWidth, signHeight, 0.08);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(width / 2 + 0.25, -height / 2 + signHeight / 2 + MACHIYA_CONFIG.STORY_HEIGHT * 0.3, depth / 2 - 0.2);
    group.add(sign);
    this.meshes.push(sign);

    // Sign outline
    const outline = createOutlineMesh(sign, 0.04);
    outline.position.copy(sign.position);
    group.add(outline);
    this.meshes.push(outline);
  }

  /**
   * Create potted plant
   */
  createPottedPlant(group, width, height, depth) {
    const potMat = createToonMaterial({ color: 0x8B4513 }); // Brown pot
    const plantMat = createToonMaterial({ color: 0x2E7D32 }); // Green plant

    // Pot
    const potGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 8);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(width / 2 - 0.3, -height / 2 + 0.15, depth / 2 + 0.2);
    group.add(pot);
    this.meshes.push(pot);

    // Plant foliage
    const plantGeo = new THREE.SphereGeometry(0.2, 6, 6);
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.set(width / 2 - 0.3, -height / 2 + 0.4, depth / 2 + 0.2);
    plant.scale.set(1, 1.3, 1);
    group.add(plant);
    this.meshes.push(plant);
  }

  /**
   * Create paper lantern
   */
  createLantern(group, width, height, depth) {
    const lanternMat = createToonMaterial({ color: 0xFFE4B5 }); // Cream paper
    const frameMat = createToonMaterial({ color: MACHIYA_COLORS.WOOD_DARK });

    // Lantern body
    const lanternGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 8);
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(-width / 2 - 0.3, -height / 2 + MACHIYA_CONFIG.STORY_HEIGHT - 0.5, depth / 2);
    group.add(lantern);
    this.meshes.push(lantern);

    // Top cap
    const capGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.08, 8);
    const topCap = new THREE.Mesh(capGeo, frameMat);
    topCap.position.set(0, 0.2, 0);
    lantern.add(topCap);
    this.meshes.push(topCap);

    // Bottom cap
    const bottomCap = new THREE.Mesh(capGeo, frameMat);
    bottomCap.position.set(0, -0.2, 0);
    bottomCap.rotation.x = Math.PI;
    lantern.add(bottomCap);
    this.meshes.push(bottomCap);
  }

  /**
   * Get random preset
   */
  getRandomPreset() {
    const presets = Object.keys(MACHIYA_PRESETS);
    return presets[Math.floor(Math.random() * presets.length)];
  }

  /**
   * Utility function for random range
   */
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Get collision meshes for player collision detection
   */
  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  /**
   * Dispose all buildings
   */
  dispose() {
    this.meshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    this.buildings.forEach(b => {
      this.scene.remove(b.group);
    });

    this.buildings = [];
    this.meshes = [];
    this.collisionMeshes = [];
  }
}
