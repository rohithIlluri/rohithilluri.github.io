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

// Building color palette (messenger.abeto.co style - warm, muted tones)
const BUILDING_COLORS = {
  cream: 0xE8DFD0,      // Primary - warm cream (most common)
  peach: 0xE8D0C0,      // Secondary - soft peach
  sage: 0xC8D8C8,       // Accent - muted sage green
  lavender: 0xD8D0E0,   // Accent - soft lavender
  terracotta: 0xD8A888, // Accent - warm terracotta
  warmGray: 0xB8AFA0,   // Neutral - warm gray
  mint: 0xB8D8D0,       // Muted mint (softer than before)
  coral: 0xE8C0B8,      // Soft coral/blush
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
  path: 0xBCAAA4,       // Walkway (legacy)
};

// Street color palette (messenger.abeto.co style)
const STREET_COLORS = {
  asphalt: 0x5A6A6A,      // Blue-gray road
  asphaltLight: 0x6B7B7B, // Lighter road variation
  sidewalk: 0xD4CFC5,     // Warm cream sidewalk
  sidewalkEdge: 0xB8AFA0, // Darker sidewalk edge/curb
  curb: 0xA0A0A0,         // Concrete curb
  centerLine: 0xE8B84A,   // Yellow center line
  edgeLine: 0xE8E8E0,     // White edge line
  crosswalk: 0xF5F5F0,    // Off-white crosswalk
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

    // Add crosswalks near main buildings
    this.addCrosswalks();
  }

  /**
   * Add crosswalks at key locations (messenger.abeto.co style)
   */
  addCrosswalks() {
    const crosswalkMat = createToonMaterial({ color: STREET_COLORS.crosswalk });

    // Crosswalk locations (lat, lon) - near main buildings
    const crosswalkLocations = [
      { lat: 0, lon: 85 },   // Near Skills Library (West)
      { lat: 0, lon: 95 },
      { lat: 0, lon: -85 },  // Near Music Shop (East)
      { lat: 0, lon: -95 },
      { lat: 40, lon: -5 },  // Near Projects Tower (North)
      { lat: 40, lon: 5 },
      { lat: -40, lon: -5 }, // Near Contact Cafe (South)
      { lat: -40, lon: 5 },
    ];

    crosswalkLocations.forEach(loc => {
      this.createCrosswalk(loc.lat, loc.lon, crosswalkMat);
    });
  }

  /**
   * Create a zebra crossing at specified position
   */
  createCrosswalk(lat, lon, material) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    const crosswalkGroup = new THREE.Group();
    const stripeCount = 6;
    const stripeWidth = 0.3;
    const stripeLength = 1.8;
    const stripeGap = 0.2;

    for (let i = 0; i < stripeCount; i++) {
      const stripeGeo = new THREE.BoxGeometry(stripeLength, 0.02, stripeWidth);
      const stripe = new THREE.Mesh(stripeGeo, material);
      stripe.position.z = (i - (stripeCount - 1) / 2) * (stripeWidth + stripeGap);
      stripe.position.y = 0.02; // Slightly above road
      crosswalkGroup.add(stripe);
      this.meshes.push(stripe);
    }

    // Position and orient on planet surface
    crosswalkGroup.position.copy(surfacePos).add(up.clone().multiplyScalar(0.01));
    crosswalkGroup.quaternion.copy(orientation);

    this.scene.add(crosswalkGroup);
    this.meshes.push(crosswalkGroup);
  }

  /**
   * Create a detailed street ring at given latitude (messenger.abeto.co style)
   * Includes road, sidewalks, curbs, and road markings
   */
  createPathRing(latitude, totalWidth) {
    const ringRadius = this.radius * Math.cos(THREE.MathUtils.degToRad(latitude));
    const ringY = this.radius * Math.sin(THREE.MathUtils.degToRad(latitude));

    const roadWidth = totalWidth * 0.5;      // 50% road
    const sidewalkWidth = totalWidth * 0.22; // 22% each sidewalk
    const curbWidth = 0.08;                  // Small curb

    // === ROAD (center) ===
    const roadGeo = new THREE.TorusGeometry(ringRadius, roadWidth / 2, 8, 96);
    const roadMat = createToonMaterial({ color: STREET_COLORS.asphalt });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.y = ringY;
    road.rotation.x = Math.PI / 2;
    road.receiveShadow = true;
    this.scene.add(road);
    this.meshes.push(road);

    // === OUTER SIDEWALK ===
    const outerSidewalkGeo = new THREE.TorusGeometry(
      ringRadius + roadWidth / 2 + sidewalkWidth / 2 + curbWidth,
      sidewalkWidth / 2,
      6,
      96
    );
    const sidewalkMat = createToonMaterial({ color: STREET_COLORS.sidewalk });
    const outerSidewalk = new THREE.Mesh(outerSidewalkGeo, sidewalkMat);
    outerSidewalk.position.y = ringY + 0.02; // Slightly raised
    outerSidewalk.rotation.x = Math.PI / 2;
    outerSidewalk.receiveShadow = true;
    this.scene.add(outerSidewalk);
    this.meshes.push(outerSidewalk);

    // === INNER SIDEWALK ===
    const innerSidewalkGeo = new THREE.TorusGeometry(
      ringRadius - roadWidth / 2 - sidewalkWidth / 2 - curbWidth,
      sidewalkWidth / 2,
      6,
      96
    );
    const innerSidewalk = new THREE.Mesh(innerSidewalkGeo, sidewalkMat);
    innerSidewalk.position.y = ringY + 0.02;
    innerSidewalk.rotation.x = Math.PI / 2;
    innerSidewalk.receiveShadow = true;
    this.scene.add(innerSidewalk);
    this.meshes.push(innerSidewalk);

    // === CURBS (between road and sidewalk) ===
    const curbMat = createToonMaterial({ color: STREET_COLORS.curb });

    // Outer curb
    const outerCurbGeo = new THREE.TorusGeometry(
      ringRadius + roadWidth / 2 + curbWidth / 2,
      curbWidth / 2 + 0.03,
      4,
      96
    );
    const outerCurb = new THREE.Mesh(outerCurbGeo, curbMat);
    outerCurb.position.y = ringY + 0.04; // Raised curb
    outerCurb.rotation.x = Math.PI / 2;
    this.scene.add(outerCurb);
    this.meshes.push(outerCurb);

    // Inner curb
    const innerCurbGeo = new THREE.TorusGeometry(
      ringRadius - roadWidth / 2 - curbWidth / 2,
      curbWidth / 2 + 0.03,
      4,
      96
    );
    const innerCurb = new THREE.Mesh(innerCurbGeo, curbMat);
    innerCurb.position.y = ringY + 0.04;
    innerCurb.rotation.x = Math.PI / 2;
    this.scene.add(innerCurb);
    this.meshes.push(innerCurb);

    // === CENTER LINE (yellow dashed) ===
    this.addCenterLine(ringRadius, ringY);

    // === EDGE LINES (white solid) ===
    this.addEdgeLines(ringRadius, ringY, roadWidth);
  }

  /**
   * Add dashed yellow center line to road
   */
  addCenterLine(ringRadius, ringY) {
    const lineMat = createToonMaterial({ color: STREET_COLORS.centerLine });
    const dashCount = 48; // Number of dashes around the ring
    const dashLength = 0.6;
    const dashWidth = 0.08;
    const dashHeight = 0.02;

    for (let i = 0; i < dashCount; i++) {
      const angle = (i / dashCount) * Math.PI * 2;

      // Create dash as a small box
      const dashGeo = new THREE.BoxGeometry(dashWidth, dashHeight, dashLength);
      const dash = new THREE.Mesh(dashGeo, lineMat);

      // Position on the ring
      dash.position.x = Math.cos(angle) * ringRadius;
      dash.position.z = Math.sin(angle) * ringRadius;
      dash.position.y = ringY + 0.01;

      // Rotate to follow the ring
      dash.rotation.y = -angle + Math.PI / 2;

      this.scene.add(dash);
      this.meshes.push(dash);
    }
  }

  /**
   * Add white edge lines to road
   */
  addEdgeLines(ringRadius, ringY, roadWidth) {
    const lineMat = createToonMaterial({ color: STREET_COLORS.edgeLine });
    const lineWidth = 0.06;

    // Outer edge line
    const outerLineGeo = new THREE.TorusGeometry(
      ringRadius + roadWidth / 2 - lineWidth,
      lineWidth / 2,
      4,
      96
    );
    const outerLine = new THREE.Mesh(outerLineGeo, lineMat);
    outerLine.position.y = ringY + 0.01;
    outerLine.rotation.x = Math.PI / 2;
    this.scene.add(outerLine);
    this.meshes.push(outerLine);

    // Inner edge line
    const innerLineGeo = new THREE.TorusGeometry(
      ringRadius - roadWidth / 2 + lineWidth,
      lineWidth / 2,
      4,
      96
    );
    const innerLine = new THREE.Mesh(innerLineGeo, lineMat);
    innerLine.position.y = ringY + 0.01;
    innerLine.rotation.x = Math.PI / 2;
    this.scene.add(innerLine);
    this.meshes.push(innerLine);
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
   * Create a detailed multi-story building at the specified latitude/longitude
   * Matches messenger.abeto.co visual style with storefronts, varied windows, and architectural details
   */
  createBuilding(config) {
    const {
      lat,
      lon,
      name,
      type,
      color,
      neonColor,
      width,
      height,
      depth,
      floors = 3,
    } = config;

    // Get position on planet surface
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);

    // Create main building body
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

    // Add building base/plinth for grounded look
    const plinthHeight = 0.4;
    const plinthGeo = new THREE.BoxGeometry(width + 0.3, plinthHeight, depth + 0.3);
    const plinthMat = createToonMaterial({ color: 0x5A5A5A });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -height / 2 + plinthHeight / 2, 0);
    plinth.castShadow = true;
    building.add(plinth);
    this.meshes.push(plinth);

    // Plinth outline
    const plinthOutline = createOutlineMesh(plinth, 0.1);
    plinthOutline.position.copy(plinth.position);
    building.add(plinthOutline);
    this.meshes.push(plinthOutline);

    // Create thick outline for the building (0.12 for better visibility)
    const outline = createOutlineMesh(building, 0.12);
    outline.position.copy(building.position);
    outline.quaternion.copy(building.quaternion);
    this.scene.add(outline);
    this.meshes.push(outline);

    // Calculate floor height
    const floorHeight = (height - 1) / floors;

    // Add ground floor storefront
    this.addStorefront(building, width, height, depth, floorHeight);

    // Add windows for upper floors with varied layouts
    for (let floor = 1; floor < floors; floor++) {
      this.addFloorWindows(building, width, height, depth, floor, floorHeight, floors);
    }

    // Add roof parapet
    this.addRoofParapet(building, width, height, depth, color);

    // Add water tank on tall buildings (5+ floors)
    if (floors >= 5) {
      this.addWaterTank(building, width, height, depth);
    }

    // Add Japanese-style vertical sign on some buildings
    if (Math.random() > 0.3) {
      this.addBuildingSign(building, width, height, depth, name);
    }

    // Add neon sign on front
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
   * Add a ground floor storefront with glass windows and colored awning
   */
  addStorefront(building, width, height, depth, floorHeight) {
    const storefrontHeight = floorHeight * 0.9;
    const storefrontY = -height / 2 + storefrontHeight / 2 + 0.1;

    // Storefront base
    const baseGeo = new THREE.BoxGeometry(width - 0.2, 0.3, 0.15);
    const baseMat = createToonMaterial({ color: 0x4A4A4A });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -height / 2 + 0.15, depth / 2 + 0.08);
    building.add(base);
    this.meshes.push(base);

    // Base outline
    const baseOutline = createOutlineMesh(base, 0.08);
    baseOutline.position.copy(base.position);
    building.add(baseOutline);
    this.meshes.push(baseOutline);

    // Large storefront windows with depth
    const windowWidth = (width - 1.5) / 2;
    const windowHeight = storefrontHeight * 0.7;
    const windowDepth = 0.2; // Deeper recess for storefront
    const windowMat = createToonMaterial({ color: 0x87CEEB });
    const frameMat = createToonMaterial({ color: 0x5A5A5A });
    const mullionMat = createToonMaterial({ color: 0x4A4A4A });

    // Left window recess
    const leftRecessGeo = new THREE.BoxGeometry(windowWidth + 0.15, windowHeight + 0.15, windowDepth);
    const recessMat = createToonMaterial({ color: 0x2A2A2A });
    const leftRecess = new THREE.Mesh(leftRecessGeo, recessMat);
    leftRecess.position.set(-(windowWidth / 2 + 0.4), storefrontY, depth / 2 - windowDepth / 2 + 0.02);
    building.add(leftRecess);
    this.meshes.push(leftRecess);

    // Left window glass
    const leftWindowGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
    const leftWindow = new THREE.Mesh(leftWindowGeo, windowMat.clone());
    leftWindow.position.set(-(windowWidth / 2 + 0.4), storefrontY, depth / 2 - windowDepth + 0.05);
    building.add(leftWindow);
    this.windowMeshes.push(leftWindow);

    // Left window mullions (2 vertical, 1 horizontal for 6 panes)
    for (let i = 1; i <= 2; i++) {
      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, windowHeight, 0.04),
        mullionMat
      );
      vMullion.position.set(-(windowWidth / 2 + 0.4) + (i - 1.5) * (windowWidth / 3), storefrontY, depth / 2 + 0.02);
      building.add(vMullion);
      this.meshes.push(vMullion);
    }
    const hMullionLeft = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, 0.05, 0.04),
      mullionMat
    );
    hMullionLeft.position.set(-(windowWidth / 2 + 0.4), storefrontY, depth / 2 + 0.02);
    building.add(hMullionLeft);
    this.meshes.push(hMullionLeft);

    // Left window frame
    this.addWindowFrame(building, -(windowWidth / 2 + 0.4), storefrontY, depth / 2 + 0.03, windowWidth, windowHeight, frameMat);

    // Right window recess
    const rightRecess = new THREE.Mesh(leftRecessGeo, recessMat);
    rightRecess.position.set((windowWidth / 2 + 0.4), storefrontY, depth / 2 - windowDepth / 2 + 0.02);
    building.add(rightRecess);
    this.meshes.push(rightRecess);

    // Right window glass
    const rightWindow = new THREE.Mesh(leftWindowGeo, windowMat.clone());
    rightWindow.position.set((windowWidth / 2 + 0.4), storefrontY, depth / 2 - windowDepth + 0.05);
    building.add(rightWindow);
    this.windowMeshes.push(rightWindow);

    // Right window mullions
    for (let i = 1; i <= 2; i++) {
      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, windowHeight, 0.04),
        mullionMat
      );
      vMullion.position.set((windowWidth / 2 + 0.4) + (i - 1.5) * (windowWidth / 3), storefrontY, depth / 2 + 0.02);
      building.add(vMullion);
      this.meshes.push(vMullion);
    }
    const hMullionRight = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, 0.05, 0.04),
      mullionMat
    );
    hMullionRight.position.set((windowWidth / 2 + 0.4), storefrontY, depth / 2 + 0.02);
    building.add(hMullionRight);
    this.meshes.push(hMullionRight);

    // Right window frame
    this.addWindowFrame(building, (windowWidth / 2 + 0.4), storefrontY, depth / 2 + 0.03, windowWidth, windowHeight, frameMat);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.0, storefrontHeight * 0.85, 0.08);
    const doorMat = createToonMaterial({ color: 0x5D4037 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, storefrontY - 0.1, depth / 2 + 0.04);
    building.add(door);
    this.meshes.push(door);

    // Door frame
    const doorFrameGeo = new THREE.BoxGeometry(1.2, storefrontHeight * 0.9, 0.06);
    const doorFrame = new THREE.Mesh(doorFrameGeo, frameMat);
    doorFrame.position.set(0, storefrontY - 0.08, depth / 2 + 0.02);
    building.add(doorFrame);
    this.meshes.push(doorFrame);

    // Door outline
    const doorOutline = createOutlineMesh(door, 0.08);
    doorOutline.position.copy(door.position);
    building.add(doorOutline);
    this.meshes.push(doorOutline);

    // Awning
    const awningColor = AWNING_COLORS[Math.floor(Math.random() * AWNING_COLORS.length)];
    const awningGeo = new THREE.BoxGeometry(width * 0.85, 0.15, 1.0);
    const awningMat = createToonMaterial({ color: awningColor });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, storefrontY + windowHeight / 2 + 0.3, depth / 2 + 0.5);
    awning.rotation.x = -0.15;
    awning.castShadow = true;
    building.add(awning);
    this.meshes.push(awning);

    // Awning outline
    const awningOutline = createOutlineMesh(awning, 0.08);
    awningOutline.position.copy(awning.position);
    awningOutline.rotation.copy(awning.rotation);
    building.add(awningOutline);
    this.meshes.push(awningOutline);

    // Awning trim
    const trimGeo = new THREE.BoxGeometry(width * 0.85, 0.08, 0.15);
    const trimMat = createToonMaterial({ color: 0xFFFFFF });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.04, 0.43);
    awning.add(trim);
    this.meshes.push(trim);
  }

  /**
   * Add window frame around a window
   */
  addWindowFrame(building, x, y, z, windowWidth, windowHeight, frameMat) {
    const frameThickness = 0.08;
    const frameDepth = 0.05;

    // Top frame
    const topGeo = new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth);
    const top = new THREE.Mesh(topGeo, frameMat);
    top.position.set(x, y + windowHeight / 2 + frameThickness / 2, z);
    building.add(top);
    this.meshes.push(top);

    // Bottom frame
    const bottom = new THREE.Mesh(topGeo, frameMat);
    bottom.position.set(x, y - windowHeight / 2 - frameThickness / 2, z);
    building.add(bottom);
    this.meshes.push(bottom);

    // Left frame
    const sideGeo = new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth);
    const left = new THREE.Mesh(sideGeo, frameMat);
    left.position.set(x - windowWidth / 2 - frameThickness / 2, y, z);
    building.add(left);
    this.meshes.push(left);

    // Right frame
    const right = new THREE.Mesh(sideGeo, frameMat);
    right.position.set(x + windowWidth / 2 + frameThickness / 2, y, z);
    building.add(right);
    this.meshes.push(right);
  }

  /**
   * Add windows for a specific floor with random AC units and balconies
   */
  addFloorWindows(building, width, height, depth, floor, floorHeight, totalFloors) {
    const windowSize = 0.9;
    const windowGap = 0.5;
    const windowsPerRow = Math.max(2, Math.floor((width - 1) / (windowSize + windowGap)));

    const floorY = -height / 2 + floorHeight * floor + floorHeight / 2 + 0.5;

    const windowMat = createToonMaterial({ color: 0x87CEEB });
    const frameMat = createToonMaterial({ color: 0x5A5A5A });

    for (let col = 0; col < windowsPerRow; col++) {
      const localX = (col - (windowsPerRow - 1) / 2) * (windowSize + windowGap);
      const windowHeight = windowSize * 1.2;
      const windowDepth = 0.15; // Recessed window

      // Window recess (dark interior)
      const recessGeo = new THREE.BoxGeometry(windowSize + 0.1, windowHeight + 0.1, windowDepth);
      const recessMat = createToonMaterial({ color: 0x2A2A2A });
      const recess = new THREE.Mesh(recessGeo, recessMat);
      recess.position.set(localX, floorY, depth / 2 - windowDepth / 2 + 0.02);
      building.add(recess);
      this.meshes.push(recess);

      // Window glass pane (inside recess)
      const windowGeo = new THREE.PlaneGeometry(windowSize, windowHeight);
      const windowMesh = new THREE.Mesh(windowGeo, windowMat.clone());
      windowMesh.position.set(localX, floorY, depth / 2 - windowDepth + 0.05);
      windowMesh.userData.isDarkWindow = Math.random() < 0.3;
      building.add(windowMesh);
      this.windowMeshes.push(windowMesh);

      // Window mullions (cross-bars dividing panes)
      const mullionMat = createToonMaterial({ color: 0x5A5A5A });
      // Vertical mullion
      const vMullionGeo = new THREE.BoxGeometry(0.04, windowHeight, 0.03);
      const vMullion = new THREE.Mesh(vMullionGeo, mullionMat);
      vMullion.position.set(localX, floorY, depth / 2 + 0.01);
      building.add(vMullion);
      this.meshes.push(vMullion);
      // Horizontal mullion
      const hMullionGeo = new THREE.BoxGeometry(windowSize, 0.04, 0.03);
      const hMullion = new THREE.Mesh(hMullionGeo, mullionMat);
      hMullion.position.set(localX, floorY, depth / 2 + 0.01);
      building.add(hMullion);
      this.meshes.push(hMullion);

      // Window frame
      this.addWindowFrame(building, localX, floorY, depth / 2 + 0.02, windowSize, windowHeight, frameMat);

      // 25% chance of decorative shutters (messenger.abeto.co European style)
      if (Math.random() < 0.25) {
        this.addWindowShutters(building, localX, floorY, depth, windowSize, windowHeight);
      }

      // Window sill
      const sillGeo = new THREE.BoxGeometry(windowSize + 0.2, 0.08, 0.15);
      const sillMat = createToonMaterial({ color: 0x757575 });
      const sill = new THREE.Mesh(sillGeo, sillMat);
      sill.position.set(localX, floorY - windowSize * 0.6 - 0.1, depth / 2 + 0.08);
      sill.castShadow = true;
      building.add(sill);
      this.meshes.push(sill);

      // Sill outline
      const sillOutline = createOutlineMesh(sill, 0.08);
      sillOutline.position.copy(sill.position);
      building.add(sillOutline);
      this.meshes.push(sillOutline);

      // 30% chance of flower box under window (messenger.abeto.co style)
      if (Math.random() < 0.3 && floor >= 1) {
        this.addFlowerBox(building, localX, floorY, depth, windowSize);
      }

      // 20% chance of AC unit (lower priority if flower box)
      if (Math.random() < 0.2 && floor > 1) {
        this.addACUnit(building, localX, floorY, depth, windowSize);
      }

      // 15% chance of balcony on upper floors
      if (Math.random() < 0.15 && floor >= 2 && floor < totalFloors - 1) {
        this.addBalcony(building, localX, floorY, depth, windowSize);
      }
    }

    // Add side windows
    this.addSideWindows(building, width, height, depth, floorY, windowSize, windowMat);
  }

  /**
   * Add simpler windows on building sides
   */
  addSideWindows(building, width, height, depth, floorY, windowSize, windowMat) {
    const windowsPerSide = Math.max(1, Math.floor((depth - 1) / (windowSize + 0.6)));

    for (let col = 0; col < windowsPerSide; col++) {
      const localZ = (col - (windowsPerSide - 1) / 2) * (windowSize + 0.6);

      // Left side window
      const leftWindowGeo = new THREE.PlaneGeometry(windowSize * 0.8, windowSize * 1.1);
      const leftWindow = new THREE.Mesh(leftWindowGeo, windowMat.clone());
      leftWindow.position.set(-width / 2 - 0.02, floorY, localZ);
      leftWindow.rotation.y = -Math.PI / 2;
      leftWindow.userData.isDarkWindow = Math.random() < 0.4;
      building.add(leftWindow);
      this.windowMeshes.push(leftWindow);

      // Right side window
      const rightWindow = new THREE.Mesh(leftWindowGeo, windowMat.clone());
      rightWindow.position.set(width / 2 + 0.02, floorY, localZ);
      rightWindow.rotation.y = Math.PI / 2;
      rightWindow.userData.isDarkWindow = Math.random() < 0.4;
      building.add(rightWindow);
      this.windowMeshes.push(rightWindow);
    }
  }

  /**
   * Add an AC unit below a window
   */
  addACUnit(building, x, y, depth, windowSize) {
    const acGeo = new THREE.BoxGeometry(0.6, 0.35, 0.45);
    const acMat = createToonMaterial({ color: 0x808080 });
    const acUnit = new THREE.Mesh(acGeo, acMat);
    acUnit.position.set(x, y - windowSize * 0.6 - 0.35, depth / 2 + 0.25);
    acUnit.castShadow = true;
    building.add(acUnit);
    this.meshes.push(acUnit);

    // AC unit outline
    const acOutline = createOutlineMesh(acUnit, 0.08);
    acOutline.position.copy(acUnit.position);
    building.add(acOutline);
    this.meshes.push(acOutline);

    // Vent grille
    const ventGeo = new THREE.PlaneGeometry(0.5, 0.25);
    const ventMat = createToonMaterial({ color: 0x4A4A4A });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0, 0, 0.23);
    acUnit.add(vent);
    this.meshes.push(vent);
  }

  /**
   * Add a small balcony in front of a window
   */
  addBalcony(building, x, y, depth, windowSize) {
    const metalMat = createToonMaterial({ color: 0x2A2A2A });

    // Balcony floor
    const floorGeo = new THREE.BoxGeometry(windowSize + 0.4, 0.06, 0.8);
    const balconyFloor = new THREE.Mesh(floorGeo, metalMat);
    balconyFloor.position.set(x, y - windowSize * 0.5, depth / 2 + 0.4);
    balconyFloor.castShadow = true;
    building.add(balconyFloor);
    this.meshes.push(balconyFloor);

    // Balcony outline
    const floorOutline = createOutlineMesh(balconyFloor, 0.08);
    floorOutline.position.copy(balconyFloor.position);
    building.add(floorOutline);
    this.meshes.push(floorOutline);

    // Railing - front
    const railFrontGeo = new THREE.BoxGeometry(windowSize + 0.4, 0.5, 0.04);
    const railFront = new THREE.Mesh(railFrontGeo, metalMat);
    railFront.position.set(0, 0.28, 0.38);
    balconyFloor.add(railFront);
    this.meshes.push(railFront);

    // Railing - sides
    const railSideGeo = new THREE.BoxGeometry(0.04, 0.5, 0.8);
    const railLeft = new THREE.Mesh(railSideGeo, metalMat);
    railLeft.position.set(-(windowSize + 0.4) / 2 + 0.02, 0.28, 0);
    balconyFloor.add(railLeft);
    this.meshes.push(railLeft);

    const railRight = new THREE.Mesh(railSideGeo, metalMat);
    railRight.position.set((windowSize + 0.4) / 2 - 0.02, 0.28, 0);
    balconyFloor.add(railRight);
    this.meshes.push(railRight);

    // Vertical bars
    const barGeo = new THREE.BoxGeometry(0.03, 0.45, 0.03);
    for (let i = 0; i < 5; i++) {
      const barX = ((i / 4) - 0.5) * (windowSize + 0.2);
      const bar = new THREE.Mesh(barGeo, metalMat);
      bar.position.set(barX, 0.25, 0.38);
      balconyFloor.add(bar);
      this.meshes.push(bar);
    }
  }

  /**
   * Add a decorative flower box under a window (messenger.abeto.co style)
   */
  addFlowerBox(building, x, y, depth, windowSize) {
    // Terracotta planter box
    const boxWidth = windowSize * 0.8;
    const boxHeight = 0.18;
    const boxDepth = 0.22;

    const planterMat = createToonMaterial({ color: 0xB87A5A }); // Terracotta
    const soilMat = createToonMaterial({ color: 0x5A4030 }); // Dark soil

    // Planter box
    const boxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const planter = new THREE.Mesh(boxGeo, planterMat);
    planter.position.set(x, y - windowSize * 0.6 - 0.22, depth / 2 + boxDepth / 2 + 0.08);
    planter.castShadow = true;
    building.add(planter);
    this.meshes.push(planter);

    // Planter outline
    const planterOutline = createOutlineMesh(planter, 0.06);
    planterOutline.position.copy(planter.position);
    building.add(planterOutline);
    this.meshes.push(planterOutline);

    // Soil top
    const soilGeo = new THREE.BoxGeometry(boxWidth - 0.06, 0.04, boxDepth - 0.06);
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.set(0, boxHeight / 2 - 0.02, 0);
    planter.add(soil);
    this.meshes.push(soil);

    // Flowers - small colorful spheres (3-5 flowers)
    const flowerColors = [0xFF6B8A, 0xFFD54F, 0xE87AA4, 0xFF8A65, 0xBA68C8]; // Pink, yellow, magenta, orange, purple
    const flowerCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < flowerCount; i++) {
      const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const flowerMat = createToonMaterial({ color: flowerColor });

      // Flower blob (small sphere)
      const flowerGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.03, 6, 6);
      const flower = new THREE.Mesh(flowerGeo, flowerMat);

      const flowerX = ((i + 0.5) / flowerCount - 0.5) * (boxWidth - 0.15);
      const flowerY = boxHeight / 2 + 0.08 + Math.random() * 0.05;
      const flowerZ = (Math.random() - 0.5) * (boxDepth - 0.1);

      flower.position.set(flowerX, flowerY, flowerZ);
      planter.add(flower);
      this.meshes.push(flower);
    }

    // Leaves/foliage (small green spheres behind flowers)
    const leafMat = createToonMaterial({ color: 0x4CAF50 });
    for (let i = 0; i < flowerCount + 1; i++) {
      const leafGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.02, 5, 5);
      const leaf = new THREE.Mesh(leafGeo, leafMat);

      const leafX = ((i + 0.3) / (flowerCount + 1) - 0.5) * (boxWidth - 0.1);
      const leafY = boxHeight / 2 + 0.04 + Math.random() * 0.03;
      const leafZ = (Math.random() - 0.5) * (boxDepth - 0.12);

      leaf.position.set(leafX, leafY, leafZ);
      leaf.scale.y = 0.7; // Flatten slightly
      planter.add(leaf);
      this.meshes.push(leaf);
    }
  }

  /**
   * Add decorative window shutters (European/messenger.abeto.co style)
   */
  addWindowShutters(building, x, y, depth, windowWidth, windowHeight) {
    // Shutter colors - muted blue-gray or sage green
    const shutterColors = [0x5A6B6A, 0x6B7B7A, 0x5B7B6B, 0x7B6B6A];
    const shutterColor = shutterColors[Math.floor(Math.random() * shutterColors.length)];
    const shutterMat = createToonMaterial({ color: shutterColor });

    const shutterWidth = windowWidth * 0.3;
    const shutterHeight = windowHeight + 0.1;
    const shutterDepth = 0.06;

    // Left shutter
    const shutterGeo = new THREE.BoxGeometry(shutterWidth, shutterHeight, shutterDepth);
    const leftShutter = new THREE.Mesh(shutterGeo, shutterMat);
    leftShutter.position.set(
      x - windowWidth / 2 - shutterWidth / 2 - 0.05,
      y,
      depth / 2 + 0.04
    );
    leftShutter.castShadow = true;
    building.add(leftShutter);
    this.meshes.push(leftShutter);

    // Left shutter outline
    const leftOutline = createOutlineMesh(leftShutter, 0.05);
    leftOutline.position.copy(leftShutter.position);
    building.add(leftOutline);
    this.meshes.push(leftOutline);

    // Right shutter
    const rightShutter = new THREE.Mesh(shutterGeo, shutterMat);
    rightShutter.position.set(
      x + windowWidth / 2 + shutterWidth / 2 + 0.05,
      y,
      depth / 2 + 0.04
    );
    rightShutter.castShadow = true;
    building.add(rightShutter);
    this.meshes.push(rightShutter);

    // Right shutter outline
    const rightOutline = createOutlineMesh(rightShutter, 0.05);
    rightOutline.position.copy(rightShutter.position);
    building.add(rightOutline);
    this.meshes.push(rightOutline);

    // Horizontal slats on shutters (3 slats each) for detail
    const slatMat = createToonMaterial({ color: this.darkenColor(shutterColor, 0.15) });
    const slatGeo = new THREE.BoxGeometry(shutterWidth - 0.04, 0.02, shutterDepth + 0.02);

    for (let i = 0; i < 3; i++) {
      const slatY = ((i / 2) - 0.5) * (shutterHeight * 0.7);

      // Left shutter slats
      const leftSlat = new THREE.Mesh(slatGeo, slatMat);
      leftSlat.position.set(0, slatY, 0.01);
      leftShutter.add(leftSlat);
      this.meshes.push(leftSlat);

      // Right shutter slats
      const rightSlat = new THREE.Mesh(slatGeo, slatMat);
      rightSlat.position.set(0, slatY, 0.01);
      rightShutter.add(rightSlat);
      this.meshes.push(rightSlat);
    }
  }

  /**
   * Add roof parapet and edge details with decorative cornice
   */
  addRoofParapet(building, width, height, depth, baseColor) {
    const parapetHeight = 0.4;
    const parapetColor = this.darkenColor(baseColor, 0.1);
    const parapetMat = createToonMaterial({ color: parapetColor });
    const trimMat = createToonMaterial({ color: 0xF5F0E8 }); // Off-white trim

    // Front parapet
    const frontGeo = new THREE.BoxGeometry(width + 0.3, parapetHeight, 0.15);
    const front = new THREE.Mesh(frontGeo, parapetMat);
    front.position.set(0, height / 2 + parapetHeight / 2, depth / 2 + 0.075);
    front.castShadow = true;
    building.add(front);
    this.meshes.push(front);

    // Front parapet outline
    const frontOutline = createOutlineMesh(front, 0.08);
    frontOutline.position.copy(front.position);
    building.add(frontOutline);
    this.meshes.push(frontOutline);

    // Back parapet
    const back = new THREE.Mesh(frontGeo, parapetMat);
    back.position.set(0, height / 2 + parapetHeight / 2, -depth / 2 - 0.075);
    back.castShadow = true;
    building.add(back);
    this.meshes.push(back);

    // Side parapets
    const sideGeo = new THREE.BoxGeometry(0.15, parapetHeight, depth + 0.3);
    const left = new THREE.Mesh(sideGeo, parapetMat);
    left.position.set(-width / 2 - 0.075, height / 2 + parapetHeight / 2, 0);
    left.castShadow = true;
    building.add(left);
    this.meshes.push(left);

    const right = new THREE.Mesh(sideGeo, parapetMat);
    right.position.set(width / 2 + 0.075, height / 2 + parapetHeight / 2, 0);
    right.castShadow = true;
    building.add(right);
    this.meshes.push(right);

    // Parapet cap
    const capGeo = new THREE.BoxGeometry(width + 0.5, 0.1, depth + 0.5);
    const capMat = createToonMaterial({ color: 0x757575 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, height / 2 + parapetHeight + 0.05, 0);
    building.add(cap);
    this.meshes.push(cap);

    // Cap outline
    const capOutline = createOutlineMesh(cap, 0.08);
    capOutline.position.copy(cap.position);
    building.add(capOutline);
    this.meshes.push(capOutline);

    // === DECORATIVE CORNICE (messenger.abeto.co style) ===
    // Main cornice band (sits just below parapet)
    const corniceHeight = 0.25;
    const corniceGeo = new THREE.BoxGeometry(width + 0.4, corniceHeight, 0.25);
    const cornice = new THREE.Mesh(corniceGeo, trimMat);
    cornice.position.set(0, height / 2 - 0.1, depth / 2 + 0.12);
    cornice.castShadow = true;
    building.add(cornice);
    this.meshes.push(cornice);

    // Cornice outline
    const corniceOutline = createOutlineMesh(cornice, 0.06);
    corniceOutline.position.copy(cornice.position);
    building.add(corniceOutline);
    this.meshes.push(corniceOutline);

    // Upper cornice lip (overhang)
    const lipGeo = new THREE.BoxGeometry(width + 0.5, 0.08, 0.35);
    const lip = new THREE.Mesh(lipGeo, trimMat);
    lip.position.set(0, height / 2, depth / 2 + 0.17);
    building.add(lip);
    this.meshes.push(lip);

    // Dentil molding (small blocks under cornice for detail)
    const dentilCount = Math.floor(width / 0.4);
    const dentilGeo = new THREE.BoxGeometry(0.15, 0.12, 0.08);
    for (let i = 0; i < dentilCount; i++) {
      const dentilX = ((i + 0.5) / dentilCount - 0.5) * width;
      const dentil = new THREE.Mesh(dentilGeo, trimMat);
      dentil.position.set(dentilX, height / 2 - 0.28, depth / 2 + 0.15);
      building.add(dentil);
      this.meshes.push(dentil);
    }

    // Back cornice (simpler)
    const backCornice = new THREE.Mesh(corniceGeo, trimMat);
    backCornice.position.set(0, height / 2 - 0.1, -depth / 2 - 0.12);
    building.add(backCornice);
    this.meshes.push(backCornice);
  }

  /**
   * Add Japanese-style vertical signage to building side
   */
  addBuildingSign(building, width, height, depth, name) {
    const signHeight = Math.min(height * 0.5, 6);
    const signWidth = 0.8;
    const signDepth = 0.15;

    // Sign panel (white background)
    const signGeo = new THREE.BoxGeometry(signWidth, signHeight, signDepth);
    const signMat = createToonMaterial({ color: 0xF5F5F5 });
    const sign = new THREE.Mesh(signGeo, signMat);

    // Position on left or right side
    const side = Math.random() > 0.5 ? 1 : -1;
    sign.position.set(
      side * (width / 2 + signDepth / 2 + 0.02),
      height * 0.15,
      depth / 4
    );
    sign.rotation.y = side * Math.PI / 2;
    sign.castShadow = true;
    building.add(sign);
    this.meshes.push(sign);

    // Sign outline
    const signOutline = createOutlineMesh(sign, 0.08);
    signOutline.position.copy(sign.position);
    signOutline.rotation.copy(sign.rotation);
    building.add(signOutline);
    this.meshes.push(signOutline);

    // Colored border
    const borderColor = SIGN_BORDER_COLORS[Math.floor(Math.random() * SIGN_BORDER_COLORS.length)];
    const borderMat = createToonMaterial({ color: borderColor });

    // Top border
    const topBorderGeo = new THREE.BoxGeometry(signWidth + 0.1, 0.12, signDepth + 0.05);
    const topBorder = new THREE.Mesh(topBorderGeo, borderMat);
    topBorder.position.set(0, signHeight / 2 + 0.06, 0);
    sign.add(topBorder);
    this.meshes.push(topBorder);

    // Bottom border
    const bottomBorder = new THREE.Mesh(topBorderGeo, borderMat);
    bottomBorder.position.set(0, -signHeight / 2 - 0.06, 0);
    sign.add(bottomBorder);
    this.meshes.push(bottomBorder);

    // Side borders
    const sideBorderGeo = new THREE.BoxGeometry(0.1, signHeight, signDepth + 0.05);
    const leftBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    leftBorder.position.set(-signWidth / 2 - 0.05, 0, 0);
    sign.add(leftBorder);
    this.meshes.push(leftBorder);

    const rightBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    rightBorder.position.set(signWidth / 2 + 0.05, 0, 0);
    sign.add(rightBorder);
    this.meshes.push(rightBorder);
  }

  /**
   * Add a rooftop water tank (NYC iconic element)
   */
  addWaterTank(building, width, height, depth) {
    const woodMat = createToonMaterial({ color: 0x6B4423 });
    const metalMat = createToonMaterial({ color: 0x3D3D3D });

    // Tank body
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

    // Metal bands
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

    // Support legs
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
    const tankOutline = createOutlineMesh(tank, 0.08);
    tankOutline.position.copy(tank.position);
    building.add(tankOutline);
    this.meshes.push(tankOutline);
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

    // === NEW STREET FURNITURE (messenger.abeto.co style) ===

    // Bollards (sidewalk corners and crossings)
    const bollardPositions = [
      { lat: 0, lon: 83 }, { lat: 0, lon: 87 },   // Near Skills Library
      { lat: 0, lon: -83 }, { lat: 0, lon: -87 }, // Near Music Shop
      { lat: 43, lon: -3 }, { lat: 43, lon: 3 },  // Near Projects Tower
      { lat: -43, lon: -3 }, { lat: -43, lon: 3 }, // Near Contact Cafe
    ];

    bollardPositions.forEach((pos) => {
      this.createBollard(pos.lat, pos.lon);
    });

    // Newspaper boxes
    const newspaperBoxPositions = [
      { lat: 2, lon: 80 },
      { lat: -2, lon: -80 },
      { lat: 38, lon: 8 },
      { lat: -38, lon: -8 },
    ];

    newspaperBoxPositions.forEach((pos) => {
      this.createNewspaperBox(pos.lat, pos.lon);
    });

    // Potted plants at store entrances
    const pottedPlantPositions = [
      { lat: 0, lon: 88 }, { lat: 0, lon: 92 },   // Skills Library entrance
      { lat: 0, lon: -88 }, { lat: 0, lon: -92 }, // Music Shop entrance
      { lat: 44, lon: -2 }, { lat: 44, lon: 2 },  // Projects Tower entrance
      { lat: -44, lon: -2 }, { lat: -44, lon: 2 }, // Contact Cafe entrance
    ];

    pottedPlantPositions.forEach((pos) => {
      this.createPottedPlant(pos.lat, pos.lon);
    });
  }

  /**
   * Create a bollard (short post for sidewalk protection)
   */
  createBollard(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    const bollardMat = createToonMaterial({ color: 0x5A5A5A }); // Gray
    const capMat = createToonMaterial({ color: 0x8A8A8A }); // Lighter cap

    // Bollard body
    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
    const body = new THREE.Mesh(bodyGeo, bollardMat);
    body.castShadow = true;

    // Cap
    const capGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.3;
    cap.scale.y = 0.5;
    body.add(cap);
    this.meshes.push(cap);

    // Position on planet
    const bollardPos = surfacePos.clone().add(up.clone().multiplyScalar(0.3));
    body.position.copy(bollardPos);
    body.quaternion.copy(orientation);

    this.scene.add(body);
    this.meshes.push(body);

    // Outline
    const bodyOutline = createOutlineMesh(body, 0.03);
    bodyOutline.position.copy(body.position);
    bodyOutline.quaternion.copy(body.quaternion);
    this.scene.add(bodyOutline);
    this.meshes.push(bodyOutline);
  }

  /**
   * Create a newspaper box (blue or red box)
   */
  createNewspaperBox(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    const boxColors = [0x5A7ABB, 0xC85A5A, 0x5AAB8A]; // Blue, red, teal
    const boxColor = boxColors[Math.floor(Math.random() * boxColors.length)];
    const boxMat = createToonMaterial({ color: boxColor });
    const topMat = createToonMaterial({ color: 0x3A3A3A });

    // Box body
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 0.35);
    const body = new THREE.Mesh(bodyGeo, boxMat);
    body.castShadow = true;

    // Top/lid
    const topGeo = new THREE.BoxGeometry(0.42, 0.08, 0.37);
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.44;
    body.add(top);
    this.meshes.push(top);

    // Window
    const windowMat = createToonMaterial({ color: 0x1A1A1A });
    const windowGeo = new THREE.BoxGeometry(0.28, 0.35, 0.02);
    const window = new THREE.Mesh(windowGeo, windowMat);
    window.position.set(0, 0.1, 0.18);
    body.add(window);
    this.meshes.push(window);

    // Position on planet
    const boxPos = surfacePos.clone().add(up.clone().multiplyScalar(0.4));
    body.position.copy(boxPos);
    body.quaternion.copy(orientation);

    this.scene.add(body);
    this.meshes.push(body);

    // Outline
    const bodyOutline = createOutlineMesh(body, 0.04);
    bodyOutline.position.copy(body.position);
    bodyOutline.quaternion.copy(body.quaternion);
    this.scene.add(bodyOutline);
    this.meshes.push(bodyOutline);
  }

  /**
   * Create a potted plant for store entrances
   */
  createPottedPlant(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    const potMat = createToonMaterial({ color: 0xB87A5A }); // Terracotta
    const soilMat = createToonMaterial({ color: 0x5A4030 });
    const plantMat = createToonMaterial({ color: 0x4CAF50 });
    const flowerMat = createToonMaterial({ color: 0xFF6B8A }); // Pink flowers

    const group = new THREE.Group();

    // Pot
    const potGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.15;
    pot.castShadow = true;
    group.add(pot);
    this.meshes.push(pot);

    // Pot rim
    const rimGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 16);
    const rim = new THREE.Mesh(rimGeo, potMat);
    rim.position.y = 0.3;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
    this.meshes.push(rim);

    // Soil
    const soilGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8);
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.28;
    group.add(soil);
    this.meshes.push(soil);

    // Plant foliage (small bush blob)
    const foliageGeo = new THREE.SphereGeometry(0.25, 8, 6);
    const foliage = new THREE.Mesh(foliageGeo, plantMat);
    foliage.position.y = 0.5;
    foliage.scale.set(1, 0.8, 1);
    group.add(foliage);
    this.meshes.push(foliage);

    // Small flowers on top
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const flowerGeo = new THREE.SphereGeometry(0.06, 5, 4);
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(
        Math.cos(angle) * 0.15,
        0.55 + Math.random() * 0.08,
        Math.sin(angle) * 0.15
      );
      group.add(flower);
      this.meshes.push(flower);
    }

    // Position on planet
    group.position.copy(surfacePos);
    group.quaternion.copy(orientation);

    this.scene.add(group);
    this.meshes.push(group);

    // Outline for pot
    const potOutline = createOutlineMesh(pot, 0.03);
    potOutline.position.set(0, 0.15, 0);
    group.add(potOutline);
    this.meshes.push(potOutline);
  }

  /**
   * Create a tree at the specified position
   */
  createTree(lat, lon) {
    const surfacePos = this.planet.latLonToPosition(lat, lon);
    const up = this.planet.getUpVector(surfacePos);
    const orientation = this.planet.getSurfaceOrientation(surfacePos);

    // Tree group for organic blob foliage
    const treeGroup = new THREE.Group();

    // Tree trunk
    const trunkGeom = new THREE.CylinderGeometry(0.25, 0.35, 2.5, 8);
    const trunkMaterial = createToonMaterial({ color: 0x5D4037 });
    const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Trunk outline
    const trunkOutline = createOutlineMesh(trunk, 0.04);
    trunkOutline.position.copy(trunk.position);
    treeGroup.add(trunkOutline);

    // ORGANIC BLOB FOLIAGE (messenger.abeto.co style)
    // Multiple overlapping spheres for natural tree shape
    const foliageMaterial = createToonMaterial({ color: 0x4CAF50 }); // Vibrant green
    const foliageDarkMaterial = createToonMaterial({ color: 0x388E3C }); // Darker green

    // Main foliage blob positions (organic arrangement)
    const blobConfigs = [
      // Central large blob
      { x: 0, y: 3.5, z: 0, r: 1.4, mat: foliageMaterial },
      // Upper smaller blobs
      { x: 0.5, y: 4.2, z: 0.3, r: 0.9, mat: foliageMaterial },
      { x: -0.4, y: 4.0, z: -0.3, r: 0.8, mat: foliageMaterial },
      { x: 0, y: 4.5, z: 0, r: 0.7, mat: foliageMaterial },
      // Side blobs
      { x: 1.0, y: 3.2, z: 0.2, r: 0.9, mat: foliageDarkMaterial },
      { x: -0.9, y: 3.3, z: 0.3, r: 1.0, mat: foliageDarkMaterial },
      { x: 0.3, y: 3.0, z: 0.9, r: 0.85, mat: foliageMaterial },
      { x: -0.2, y: 3.1, z: -0.8, r: 0.9, mat: foliageDarkMaterial },
      // Lower side blobs
      { x: 0.7, y: 2.8, z: -0.5, r: 0.75, mat: foliageMaterial },
      { x: -0.6, y: 2.7, z: 0.6, r: 0.8, mat: foliageDarkMaterial },
    ];

    blobConfigs.forEach((cfg) => {
      const blobGeo = new THREE.SphereGeometry(cfg.r, 12, 10);
      const blob = new THREE.Mesh(blobGeo, cfg.mat);
      blob.position.set(cfg.x, cfg.y, cfg.z);
      // Slightly squash for more organic look
      blob.scale.set(1, 0.85, 1);
      blob.castShadow = true;
      treeGroup.add(blob);
    });

    // Single outline for the main foliage mass (largest blob)
    const mainFoliageGeo = new THREE.SphereGeometry(1.4, 12, 10);
    const mainFoliageOutline = createOutlineMesh(
      new THREE.Mesh(mainFoliageGeo),
      0.06
    );
    mainFoliageOutline.position.set(0, 3.5, 0);
    mainFoliageOutline.scale.set(1.3, 1.1, 1.3); // Encompass all blobs
    treeGroup.add(mainFoliageOutline);

    // Position and orient tree group on planet surface
    treeGroup.position.copy(surfacePos);
    treeGroup.quaternion.copy(orientation);

    this.scene.add(treeGroup);
    this.meshes.push(treeGroup);

    // Add collision for trunk
    const collisionMesh = new THREE.Mesh(trunkGeom, trunkMaterial);
    collisionMesh.position.copy(surfacePos.clone().add(up.clone().multiplyScalar(1.25)));
    collisionMesh.quaternion.copy(orientation);
    collisionMesh.visible = false;
    this.collisionMeshes.push(collisionMesh);

    this.props.push({ mesh: treeGroup, type: 'tree', lat, lon });
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

    // Animate vegetation sway (trees and bushes)
    this.props.forEach((prop, index) => {
      if (prop.type === 'tree' || prop.type === 'bush') {
        const mesh = prop.mesh;
        if (mesh) {
          // Gentle swaying motion unique to each tree
          const swaySpeed = 0.8 + (index % 5) * 0.1;
          const swayAmount = 0.015 + (index % 3) * 0.005;

          // Use position-based offset for natural variation
          const offset = prop.lat * 0.1 + prop.lon * 0.1;

          // Apply gentle rotation sway
          const swayX = Math.sin(this.animationTime * swaySpeed + offset) * swayAmount;
          const swayZ = Math.cos(this.animationTime * swaySpeed * 0.7 + offset) * swayAmount * 0.6;

          // Store original rotation if not stored
          if (!prop.originalRotation) {
            prop.originalRotation = mesh.rotation.clone();
          }

          // Apply sway relative to original rotation
          mesh.rotation.x = prop.originalRotation.x + swayX;
          mesh.rotation.z = prop.originalRotation.z + swayZ;
        }
      }
    });
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
    // Muted green colors (messenger.abeto.co style - not bright)
    const grassColors = [0x5A8B4A, 0x6B9B5A, 0x7AAB6A, 0x4A7B3A]; // More muted greens

    const dummy = new THREE.Object3D();
    const grassCount = 800; // Increased density for lush look

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
    // Flower colors (messenger.abeto.co style - softer, more varied)
    const flowerColors = [
      { petal: 0xFF6B8A, center: 0xFFD54F }, // Soft pink with gold center
      { petal: 0xF5F5F0, center: 0xFFD54F }, // Cream daisy
      { petal: 0xBA68C8, center: 0xFFEB3B }, // Lavender purple
      { petal: 0xFF8A65, center: 0xFFD54F }, // Soft coral
      { petal: 0xE88B8B, center: 0xFFEB3B }, // Muted red
      { petal: 0xFFE082, center: 0xD4A03A }, // Yellow tulip style
    ];

    const flowerCount = 200; // Increased variety
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
