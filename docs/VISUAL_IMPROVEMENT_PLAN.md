# Messenger Clone Visual Improvement Plan

## Reference Analysis: messenger.abeto.co

**Live Reference:** https://messenger.abeto.co/

### Visual Style Characteristics

The reference game has a distinctive "graphic novel" / "manga illustration" aesthetic:

1. **Consistent Black Outlines** - Every object has clean 2-4px black outlines
2. **Cel-Shading** - Flat color bands with soft shadow transitions
3. **Muted Color Palette** - Pastel/desaturated colors, never oversaturated
4. **Dense Urban Environment** - Many buildings, props, and details
5. **Japanese Urban Aesthetic** - Vending machines, signage, compact buildings

---

## Agent 1: Building Architecture Overhaul

### File to Modify
`src/environment/Planet.js`

### Current Problem
Buildings are simple boxes with basic grid windows. They look primitive compared to the detailed multi-story apartments in the reference.

### Target Visual
- 3-5 story apartment buildings
- Ground floor shops with awnings
- Varied window layouts (some with AC units, some with balconies)
- Korean/Japanese style signage
- Multiple building colors

### Color Palette for Buildings

```javascript
const BUILDING_PALETTE = {
  // Main wall colors
  cream: 0xE8DFD0,        // Most common - warm cream
  warmGray: 0xB8AFA0,     // Secondary
  coolGray: 0x8A9090,     // Modern buildings
  mint: 0x8ECAC6,         // Accent buildings
  coral: 0xE8A8A0,        // Accent buildings
  sage: 0xA8C0A8,         // Green-tinted

  // Detail colors
  windowDark: 0x3A4A4A,   // Window glass
  windowFrame: 0x5A5A5A,  // Window frames
  awningRed: 0xC85A5A,    // Red awnings
  awningGreen: 0x5A8B6A,  // Green awnings
  awningBlue: 0x5A7AAA,   // Blue awnings
  signWhite: 0xF5F5F5,    // Sign backgrounds
  signText: 0x2A2A2A,     // Sign text color
};
```

### Code: Enhanced Building Generator

Replace the `createBuilding()` method with this enhanced version:

```javascript
/**
 * Create a detailed multi-story building at the specified position
 * Matches messenger.abeto.co architectural style
 */
createBuilding(config) {
  const { lat, lon, name, type, width, height, depth, floors = 4 } = config;

  // Get position on planet surface
  const surfacePos = this.planet.latLonToPosition(lat, lon);
  const up = this.planet.getUpVector(surfacePos);
  const orientation = this.planet.getSurfaceOrientation(surfacePos);

  // Building group
  const buildingGroup = new THREE.Group();

  // Random building color from palette
  const wallColors = [0xE8DFD0, 0xB8AFA0, 0x8A9090, 0x8ECAC6, 0xE8A8A0];
  const wallColor = wallColors[Math.floor(Math.random() * wallColors.length)];

  const wallMaterial = createEnhancedToonMaterial({
    color: wallColor,
    isCharacter: false,
    lightDirection: this.lightDirection,
  });

  // === MAIN BUILDING BODY ===
  const floorHeight = height / floors;
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, wallMaterial);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  buildingGroup.add(body);

  // Building outline (CRITICAL for graphic novel look)
  const bodyOutline = createOutlineMesh(body, 0.08);
  bodyOutline.position.copy(body.position);
  buildingGroup.add(bodyOutline);

  // === GROUND FLOOR STOREFRONT ===
  this.addStorefront(buildingGroup, width, depth, floorHeight);

  // === WINDOWS FOR EACH FLOOR ===
  for (let floor = 1; floor < floors; floor++) {
    this.addFloorWindows(buildingGroup, width, depth, floorHeight, floor, floors);
  }

  // === ROOF DETAILS ===
  this.addRoofDetails(buildingGroup, width, height, depth);

  // === BUILDING SIGNAGE ===
  if (type === 'shop' || Math.random() > 0.5) {
    this.addBuildingSign(buildingGroup, name, width, height, depth);
  }

  // Position on planet
  buildingGroup.position.copy(surfacePos);
  buildingGroup.quaternion.copy(orientation);

  this.scene.add(buildingGroup);
  this.meshes.push(buildingGroup);
  this.collisionMeshes.push(body);

  return buildingGroup;
}

/**
 * Add storefront to ground floor
 */
addStorefront(buildingGroup, width, depth, floorHeight) {
  // Glass storefront window
  const windowMat = createToonMaterial({ color: 0x5A8AAA });
  const windowGeo = new THREE.BoxGeometry(width * 0.7, floorHeight * 0.6, 0.05);
  const storeWindow = new THREE.Mesh(windowGeo, windowMat);
  storeWindow.position.set(0, floorHeight * 0.4, depth / 2 + 0.03);
  buildingGroup.add(storeWindow);

  // Door
  const doorMat = createToonMaterial({ color: 0x5A4A3A });
  const doorGeo = new THREE.BoxGeometry(width * 0.2, floorHeight * 0.8, 0.05);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(width * 0.3, floorHeight * 0.4, depth / 2 + 0.03);
  buildingGroup.add(door);

  // Awning
  const awningColors = [0xC85A5A, 0x5A8B6A, 0x5A7AAA, 0xE8B84A];
  const awningColor = awningColors[Math.floor(Math.random() * awningColors.length)];
  const awningMat = createToonMaterial({ color: awningColor });
  const awningGeo = new THREE.BoxGeometry(width * 0.8, 0.1, 0.8);
  const awning = new THREE.Mesh(awningGeo, awningMat);
  awning.position.set(0, floorHeight * 0.85, depth / 2 + 0.4);
  awning.castShadow = true;
  buildingGroup.add(awning);

  // Awning outline
  const awningOutline = createOutlineMesh(awning, 0.03);
  awningOutline.position.copy(awning.position);
  buildingGroup.add(awningOutline);
}

/**
 * Add windows to a floor
 */
addFloorWindows(buildingGroup, width, depth, floorHeight, floor, totalFloors) {
  const windowMat = createToonMaterial({ color: 0x5A8AAA });
  const frameMat = createToonMaterial({ color: 0x5A5A5A });

  const windowsPerRow = Math.floor(width / 1.5);
  const windowWidth = 0.8;
  const windowHeight = floorHeight * 0.5;
  const spacing = width / (windowsPerRow + 1);

  for (let w = 0; w < windowsPerRow; w++) {
    const xPos = -width / 2 + spacing * (w + 1);
    const yPos = floorHeight * floor + floorHeight * 0.5;

    // Window frame
    const frameGeo = new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, 0.05);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(xPos, yPos, depth / 2 + 0.01);
    buildingGroup.add(frame);

    // Window glass
    const glassGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.03);
    const glass = new THREE.Mesh(glassGeo, windowMat.clone());
    glass.position.set(xPos, yPos, depth / 2 + 0.03);
    glass.userData.isWindow = true;
    glass.userData.isDarkWindow = Math.random() < 0.3;
    buildingGroup.add(glass);
    this.windowMeshes.push(glass);

    // Random: Add AC unit to some windows
    if (Math.random() < 0.2) {
      this.addACUnit(buildingGroup, xPos, yPos - windowHeight/2 - 0.2, depth);
    }

    // Random: Add small balcony to some windows
    if (Math.random() < 0.15 && floor > 1) {
      this.addBalcony(buildingGroup, xPos, yPos - windowHeight/2, depth, windowWidth);
    }
  }
}

/**
 * Add AC unit detail
 */
addACUnit(buildingGroup, x, y, depth) {
  const acMat = createToonMaterial({ color: 0x8A8A8A });
  const acGeo = new THREE.BoxGeometry(0.6, 0.3, 0.4);
  const ac = new THREE.Mesh(acGeo, acMat);
  ac.position.set(x, y, depth / 2 + 0.2);
  ac.castShadow = true;
  buildingGroup.add(ac);

  const acOutline = createOutlineMesh(ac, 0.02);
  acOutline.position.copy(ac.position);
  buildingGroup.add(acOutline);
}

/**
 * Add small balcony
 */
addBalcony(buildingGroup, x, y, depth, windowWidth) {
  const railMat = createToonMaterial({ color: 0x3A3A3A });

  // Floor
  const floorGeo = new THREE.BoxGeometry(windowWidth + 0.3, 0.05, 0.4);
  const floor = new THREE.Mesh(floorGeo, railMat);
  floor.position.set(x, y, depth / 2 + 0.2);
  buildingGroup.add(floor);

  // Railing front
  const railGeo = new THREE.BoxGeometry(windowWidth + 0.3, 0.4, 0.03);
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.position.set(x, y + 0.2, depth / 2 + 0.4);
  buildingGroup.add(rail);
}

/**
 * Add roof details (parapet, water tank, antenna)
 */
addRoofDetails(buildingGroup, width, height, depth) {
  // Parapet (raised edge)
  const parapetMat = createToonMaterial({ color: 0x9A9A9A });
  const parapetGeo = new THREE.BoxGeometry(width + 0.2, 0.3, depth + 0.2);
  const parapet = new THREE.Mesh(parapetGeo, parapetMat);
  parapet.position.y = height + 0.15;
  buildingGroup.add(parapet);

  // Water tank (on taller buildings)
  if (height > 10) {
    const tankMat = createToonMaterial({ color: 0x6B4423 });
    const tankGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.8, 10);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-width/4, height + 1.2, -depth/4);
    tank.castShadow = true;
    buildingGroup.add(tank);

    const tankOutline = createOutlineMesh(tank, 0.03);
    tankOutline.position.copy(tank.position);
    buildingGroup.add(tankOutline);
  }
}

/**
 * Add Japanese-style sign to building
 */
addBuildingSign(buildingGroup, name, width, height, depth) {
  // Vertical sign (common in Japan)
  const signMat = createToonMaterial({ color: 0xF5F5F5 });
  const signGeo = new THREE.BoxGeometry(0.8, 2.5, 0.1);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(width/2 + 0.45, height - 2, 0);
  sign.castShadow = true;
  buildingGroup.add(sign);

  // Sign border (colored)
  const borderColors = [0xC85A5A, 0x5ABBB8, 0xE8B84A];
  const borderMat = createToonMaterial({
    color: borderColors[Math.floor(Math.random() * borderColors.length)]
  });
  const borderGeo = new THREE.BoxGeometry(0.9, 2.6, 0.08);
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.set(width/2 + 0.45, height - 2, -0.02);
  buildingGroup.add(border);

  const signOutline = createOutlineMesh(sign, 0.02);
  signOutline.position.copy(sign.position);
  buildingGroup.add(signOutline);
}
```

### Additional Building Types

```javascript
/**
 * Create apartment building (taller, more windows)
 */
createApartmentBuilding(lat, lon) {
  return this.createBuilding({
    lat, lon,
    name: 'Apartments',
    type: 'apartment',
    width: 8,
    height: 18,
    depth: 8,
    floors: 6
  });
}

/**
 * Create corner shop (smaller, prominent signage)
 */
createCornerShop(lat, lon, name = 'Shop') {
  return this.createBuilding({
    lat, lon,
    name,
    type: 'shop',
    width: 5,
    height: 8,
    depth: 5,
    floors: 2
  });
}
```

### Building Placement Density

Add more buildings to create an urban feel:

```javascript
createPortfolioBuildings() {
  // Main portfolio buildings
  this.createBuilding({ lat: 0, lon: 90, name: 'Skills Library', type: 'tower', width: 6, height: 12, depth: 6, floors: 4 });
  this.createBuilding({ lat: 45, lon: 0, name: 'Projects Tower', type: 'tower', width: 8, height: 18, depth: 8, floors: 6 });
  this.createBuilding({ lat: 0, lon: -90, name: 'Vinyl Records', type: 'shop', width: 5, height: 6, depth: 5, floors: 2 });
  this.createBuilding({ lat: -45, lon: 0, name: 'Contact Cafe', type: 'shop', width: 5, height: 5, depth: 5, floors: 2 });

  // Additional background buildings (increased density)
  const additionalBuildings = [
    { lat: 15, lon: 70, name: 'Apt 1', width: 6, height: 14, depth: 6, floors: 5 },
    { lat: -15, lon: 70, name: 'Apt 2', width: 5, height: 10, depth: 5, floors: 4 },
    { lat: 15, lon: 110, name: 'Shop A', width: 4, height: 6, depth: 4, floors: 2 },
    { lat: -15, lon: 110, name: 'Shop B', width: 4, height: 6, depth: 4, floors: 2 },
    { lat: 30, lon: -30, name: 'Apt 3', width: 7, height: 16, depth: 7, floors: 5 },
    { lat: -30, lon: -30, name: 'Apt 4', width: 6, height: 12, depth: 6, floors: 4 },
    { lat: 30, lon: 30, name: 'Shop C', width: 5, height: 8, depth: 5, floors: 3 },
    { lat: -30, lon: 30, name: 'Shop D', width: 5, height: 8, depth: 5, floors: 3 },
  ];

  additionalBuildings.forEach(config => {
    this.createBuilding({ ...config, type: config.height > 10 ? 'apartment' : 'shop' });
  });
}
```

---

## Agent 2: Detailed Props & Street Furniture

### File to Modify
`src/environment/Planet.js`

### Current Problem
Props are too simple and sparse. The reference has detailed Japanese vending machines, proper mailboxes, bicycles, and street furniture.

### Target Visual
- Japanese-style vending machines with glowing display
- Yellow post boxes
- Parked bicycles
- Street signs with proper design
- More density of props

### Code: Japanese Vending Machine

```javascript
/**
 * Create a detailed Japanese-style vending machine
 * Reference: Typical Japanese drink vending machines are ~1.8m tall, ~1m wide
 */
createVendingMachine(lat, lon) {
  const surfacePos = this.planet.latLonToPosition(lat, lon);
  const up = this.planet.getUpVector(surfacePos);
  const orientation = this.planet.getSurfaceOrientation(surfacePos);

  const vmGroup = new THREE.Group();

  // Vending machine colors (randomize)
  const vmColors = [
    0x2E5090,  // Blue (Suntory style)
    0xCC3333,  // Red (Coca-Cola style)
    0x228B22,  // Green (Kirin style)
    0xF5F5F5,  // White
  ];
  const mainColor = vmColors[Math.floor(Math.random() * vmColors.length)];

  // === MAIN BODY ===
  const bodyMat = createEnhancedToonMaterial({
    color: mainColor,
    isCharacter: false,
    lightDirection: this.lightDirection,
  });
  const bodyGeo = new THREE.BoxGeometry(0.9, 1.6, 0.7);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8;
  body.castShadow = true;
  vmGroup.add(body);

  // Body outline (IMPORTANT for graphic novel look)
  const bodyOutline = createOutlineMesh(body, 0.04);
  bodyOutline.position.copy(body.position);
  vmGroup.add(bodyOutline);

  // === DISPLAY WINDOW ===
  // The glass front showing drinks
  const glassMat = new THREE.MeshBasicMaterial({
    color: 0x1A3050,
    transparent: true,
    opacity: 0.8,
  });
  const glassGeo = new THREE.BoxGeometry(0.75, 0.9, 0.05);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.05, 0.33);
  vmGroup.add(glass);

  // === DRINK BOTTLES/CANS (visible through glass) ===
  const drinkColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181];
  const drinkRows = 3;
  const drinksPerRow = 4;

  for (let row = 0; row < drinkRows; row++) {
    for (let col = 0; col < drinksPerRow; col++) {
      const drinkColor = drinkColors[Math.floor(Math.random() * drinkColors.length)];
      const drinkMat = createToonMaterial({ color: drinkColor });
      const drinkGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
      const drink = new THREE.Mesh(drinkGeo, drinkMat);

      const xPos = -0.25 + col * 0.17;
      const yPos = 0.75 + row * 0.25;
      drink.position.set(xPos, yPos, 0.2);
      vmGroup.add(drink);
    }
  }

  // === TOP LIGHT PANEL (glows at night) ===
  const lightPanelMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.9,
  });
  const lightPanelGeo = new THREE.BoxGeometry(0.8, 0.15, 0.05);
  const lightPanel = new THREE.Mesh(lightPanelGeo, lightPanelMat);
  lightPanel.position.set(0, 1.55, 0.33);
  vmGroup.add(lightPanel);

  // Store for night-time glow
  this.neonSigns.push({ mesh: lightPanel, color: 0xFFFFFF, type: 'vendingLight' });

  // === COIN SLOT PANEL ===
  const panelMat = createToonMaterial({ color: 0x2A2A2A });
  const panelGeo = new THREE.BoxGeometry(0.3, 0.25, 0.05);
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0.25, 0.4, 0.33);
  vmGroup.add(panel);

  // Coin slot
  const slotMat = createToonMaterial({ color: 0x1A1A1A });
  const slotGeo = new THREE.BoxGeometry(0.08, 0.02, 0.02);
  const slot = new THREE.Mesh(slotGeo, slotMat);
  slot.position.set(0.25, 0.48, 0.36);
  vmGroup.add(slot);

  // === DISPENSING SLOT ===
  const dispenseMat = createToonMaterial({ color: 0x1A1A1A });
  const dispenseGeo = new THREE.BoxGeometry(0.25, 0.15, 0.1);
  const dispense = new THREE.Mesh(dispenseGeo, dispenseMat);
  dispense.position.set(0, 0.15, 0.3);
  vmGroup.add(dispense);

  // === BASE/FEET ===
  const baseMat = createToonMaterial({ color: 0x3A3A3A });
  const baseGeo = new THREE.BoxGeometry(0.95, 0.08, 0.75);
  const base = new THREE.Mesh(baseMat, baseGeo);
  base.position.y = 0.04;
  vmGroup.add(base);

  // Position on planet
  const vmPos = surfacePos.clone().add(up.clone().multiplyScalar(0.04));
  vmGroup.position.copy(vmPos);
  vmGroup.quaternion.copy(orientation);

  this.scene.add(vmGroup);
  this.meshes.push(vmGroup);
  this.collisionMeshes.push(body);
  this.props.push({ mesh: vmGroup, type: 'vendingMachine', lat, lon });

  return vmGroup;
}
```

### Code: Japanese Post Box (Yellow Mailbox)

```javascript
/**
 * Create a Japanese-style yellow post box
 */
createJapanesePostBox(lat, lon) {
  const surfacePos = this.planet.latLonToPosition(lat, lon);
  const up = this.planet.getUpVector(surfacePos);
  const orientation = this.planet.getSurfaceOrientation(surfacePos);

  const postGroup = new THREE.Group();

  // Main body (yellow)
  const bodyMat = createEnhancedToonMaterial({
    color: 0xE8B84A,  // Japanese post yellow
    isCharacter: false,
    lightDirection: this.lightDirection,
  });

  // Rounded rectangle shape (box + cylinder top)
  const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 0.35);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  postGroup.add(body);

  // Rounded top
  const topGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16, 1, false, 0, Math.PI);
  const top = new THREE.Mesh(topGeo, bodyMat);
  top.position.set(0, 0.9, 0);
  top.rotation.z = Math.PI / 2;
  top.rotation.y = Math.PI / 2;
  postGroup.add(top);

  // Mail slot (dark)
  const slotMat = createToonMaterial({ color: 0x2A2A2A });
  const slotGeo = new THREE.BoxGeometry(0.25, 0.03, 0.05);
  const slot = new THREE.Mesh(slotGeo, slotMat);
  slot.position.set(0, 0.75, 0.18);
  postGroup.add(slot);

  // Red stripe (Japan Post marking)
  const stripeMat = createToonMaterial({ color: 0xCC3333 });
  const stripeGeo = new THREE.BoxGeometry(0.42, 0.08, 0.01);
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.6, 0.18);
  postGroup.add(stripe);

  // Collection time panel (white)
  const panelMat = createToonMaterial({ color: 0xFFFFFF });
  const panelGeo = new THREE.BoxGeometry(0.2, 0.15, 0.01);
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 0.35, 0.18);
  postGroup.add(panel);

  // Outline for entire post box
  const bodyOutline = createOutlineMesh(body, 0.025);
  bodyOutline.position.copy(body.position);
  postGroup.add(bodyOutline);

  // Position on planet
  const postPos = surfacePos.clone().add(up.clone().multiplyScalar(0.02));
  postGroup.position.copy(postPos);
  postGroup.quaternion.copy(orientation);

  this.scene.add(postGroup);
  this.meshes.push(postGroup);
  this.collisionMeshes.push(body);
  this.props.push({ mesh: postGroup, type: 'postBox', lat, lon });

  return postGroup;
}
```

### Code: Parked Bicycle

```javascript
/**
 * Create a parked bicycle
 */
createBicycle(lat, lon) {
  const surfacePos = this.planet.latLonToPosition(lat, lon);
  const up = this.planet.getUpVector(surfacePos);
  const orientation = this.planet.getSurfaceOrientation(surfacePos);

  const bikeGroup = new THREE.Group();

  const frameMat = createToonMaterial({ color: 0x3A3A3A }); // Dark frame
  const wheelMat = createToonMaterial({ color: 0x2A2A2A }); // Black wheels
  const seatMat = createToonMaterial({ color: 0x5A3A2A });  // Brown seat

  // Wheels (2 torus shapes)
  const wheelGeo = new THREE.TorusGeometry(0.25, 0.02, 8, 24);

  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.position.set(0.35, 0.25, 0);
  frontWheel.rotation.y = Math.PI / 2;
  bikeGroup.add(frontWheel);

  const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backWheel.position.set(-0.35, 0.25, 0);
  backWheel.rotation.y = Math.PI / 2;
  bikeGroup.add(backWheel);

  // Frame (simplified as tubes)
  const frameGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6);

  // Main horizontal bar
  const mainBar = new THREE.Mesh(frameGeo, frameMat);
  mainBar.position.set(0, 0.4, 0);
  mainBar.rotation.z = Math.PI / 2;
  bikeGroup.add(mainBar);

  // Seat post
  const seatPost = new THREE.Mesh(frameGeo, frameMat);
  seatPost.position.set(-0.15, 0.5, 0);
  seatPost.rotation.z = 0.2;
  seatPost.scale.y = 0.5;
  bikeGroup.add(seatPost);

  // Handlebars
  const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6);
  const handlebar = new THREE.Mesh(handleGeo, frameMat);
  handlebar.position.set(0.3, 0.55, 0);
  bikeGroup.add(handlebar);

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.15, 0.03, 0.08);
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(-0.2, 0.65, 0);
  bikeGroup.add(seat);

  // Kickstand (to keep it upright)
  const standGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 6);
  const stand = new THREE.Mesh(standGeo, frameMat);
  stand.position.set(-0.1, 0.12, 0.1);
  stand.rotation.x = 0.3;
  bikeGroup.add(stand);

  // Position on planet
  const bikePos = surfacePos.clone().add(up.clone().multiplyScalar(0.02));
  bikeGroup.position.copy(bikePos);
  bikeGroup.quaternion.copy(orientation);

  // Random rotation for variety
  bikeGroup.rotateY(Math.random() * Math.PI * 2);

  this.scene.add(bikeGroup);
  this.meshes.push(bikeGroup);
  this.props.push({ mesh: bikeGroup, type: 'bicycle', lat, lon });

  return bikeGroup;
}
```

### Code: Street Sign

```javascript
/**
 * Create a directional street sign
 */
createStreetSign(lat, lon, direction = 'right') {
  const surfacePos = this.planet.latLonToPosition(lat, lon);
  const up = this.planet.getUpVector(surfacePos);
  const orientation = this.planet.getSurfaceOrientation(surfacePos);

  const signGroup = new THREE.Group();

  const poleMat = createToonMaterial({ color: 0x5A5A5A }); // Gray pole
  const signMat = createToonMaterial({ color: 0x006400 }); // Green sign
  const textMat = createToonMaterial({ color: 0xFFFFFF }); // White text area

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.5, 8);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 1.25;
  pole.castShadow = true;
  signGroup.add(pole);

  // Sign panel
  const signGeo = new THREE.BoxGeometry(0.8, 0.25, 0.03);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(direction === 'right' ? 0.4 : -0.4, 2.3, 0);
  signGroup.add(sign);

  // Text area (white rectangle on sign)
  const textGeo = new THREE.BoxGeometry(0.7, 0.15, 0.01);
  const text = new THREE.Mesh(textGeo, textMat);
  text.position.set(0, 0, 0.02);
  sign.add(text);

  // Arrow indicator
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0);
  arrowShape.lineTo(0.1, 0.05);
  arrowShape.lineTo(0.1, -0.05);
  arrowShape.lineTo(0, 0);

  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  const arrow = new THREE.Mesh(arrowGeo, textMat);
  arrow.position.set(direction === 'right' ? 0.3 : -0.3, 0, 0.02);
  if (direction === 'left') arrow.rotation.z = Math.PI;
  sign.add(arrow);

  // Sign outline
  const signOutline = createOutlineMesh(sign, 0.02);
  signOutline.position.copy(sign.position);
  signGroup.add(signOutline);

  // Position on planet
  const signPos = surfacePos.clone().add(up.clone().multiplyScalar(0.02));
  signGroup.position.copy(signPos);
  signGroup.quaternion.copy(orientation);

  this.scene.add(signGroup);
  this.meshes.push(signGroup);
  this.props.push({ mesh: signGroup, type: 'streetSign', lat, lon });

  return signGroup;
}
```

### Prop Placement

```javascript
createProps() {
  // ... existing prop code ...

  // Vending machines (8-10 around the planet)
  const vendingPositions = [
    { lat: 5, lon: 85 },
    { lat: -5, lon: 85 },
    { lat: 10, lon: -85 },
    { lat: -10, lon: -85 },
    { lat: 40, lon: 10 },
    { lat: -40, lon: -10 },
    { lat: 20, lon: 50 },
    { lat: -20, lon: -50 },
  ];
  vendingPositions.forEach(pos => this.createVendingMachine(pos.lat, pos.lon));

  // Japanese post boxes
  const postBoxPositions = [
    { lat: 8, lon: 88 },
    { lat: -8, lon: -88 },
    { lat: 42, lon: 5 },
    { lat: -42, lon: -5 },
  ];
  postBoxPositions.forEach(pos => this.createJapanesePostBox(pos.lat, pos.lon));

  // Bicycles
  const bikePositions = [
    { lat: 3, lon: 82 },
    { lat: -3, lon: -82 },
    { lat: 38, lon: 8 },
    { lat: -38, lon: -8 },
    { lat: 15, lon: 60 },
    { lat: -15, lon: -60 },
  ];
  bikePositions.forEach(pos => this.createBicycle(pos.lat, pos.lon));

  // Street signs
  const signPositions = [
    { lat: 0, lon: 50, dir: 'right' },
    { lat: 0, lon: -50, dir: 'left' },
    { lat: 25, lon: 0, dir: 'right' },
    { lat: -25, lon: 0, dir: 'left' },
  ];
  signPositions.forEach(pos => this.createStreetSign(pos.lat, pos.lon, pos.dir));
}
```

---

## Agent 3: Enhanced Outline System & Visual Polish

### Files to Modify
- `src/shaders/toon.js`
- `src/environment/Planet.js`
- `src/Player.js`
- `src/effects/PostProcessing.js`

### Current Problem
Outlines are too thin and inconsistent. The graphic novel look requires prominent, clean outlines on ALL objects.

### Target Visual
- Thick, consistent outlines (2-4px equivalent)
- Outline on every object including trees, props, characters
- Optional: Screen-space outline pass for guaranteed coverage

### Outline Thickness Guide

| Object Type | Outline Width | Notes |
|-------------|---------------|-------|
| Planet sphere | 0.15-0.2 | Creates silhouette effect |
| Buildings | 0.08-0.1 | Prominent |
| Large props (cars, vending machines) | 0.05-0.06 | Visible |
| Medium props (hydrants, mailboxes) | 0.03-0.04 | Clear |
| Small props (flowers, details) | 0.02 | Subtle |
| Characters | 0.015-0.02 | Refined |
| Character parts (hands, feet) | 0.008-0.01 | Fine detail |

### Code: Enhanced Outline Functions in toon.js

```javascript
/**
 * Create thick outline mesh for prominent objects (buildings, large props)
 * @param {THREE.Mesh} originalMesh The mesh to create outline for
 * @param {number} width Outline width (default 0.08 for buildings)
 * @returns {THREE.Mesh} Outline mesh
 */
export function createThickOutlineMesh(originalMesh, width = 0.08) {
  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;

      void main() {
        // Push vertices along normals
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 outlineColor;

      void main() {
        gl_FragColor = vec4(outlineColor, 1.0);
      }
    `,
    uniforms: {
      outlineWidth: { value: width },
      outlineColor: { value: new THREE.Color(0x2A2A2A) }
    },
    side: THREE.BackSide,
    depthWrite: true,
  });

  const outlineMesh = new THREE.Mesh(originalMesh.geometry.clone(), outlineMaterial);
  outlineMesh.renderOrder = -1;

  return outlineMesh;
}

/**
 * Create outline with custom color (for special effects)
 */
export function createColoredOutlineMesh(originalMesh, width = 0.05, color = 0x2A2A2A) {
  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;

      void main() {
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 outlineColor;

      void main() {
        gl_FragColor = vec4(outlineColor, 1.0);
      }
    `,
    uniforms: {
      outlineWidth: { value: width },
      outlineColor: { value: new THREE.Color(color) }
    },
    side: THREE.BackSide,
    depthWrite: true,
  });

  const outlineMesh = new THREE.Mesh(originalMesh.geometry.clone(), outlineMaterial);
  outlineMesh.renderOrder = -1;

  return outlineMesh;
}

/**
 * Update existing createOutlineMesh with better defaults
 */
export function createOutlineMesh(originalMesh, width = 0.06) {
  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;

      void main() {
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.165, 0.165, 0.165, 1.0); // #2A2A2A
      }
    `,
    uniforms: {
      outlineWidth: { value: width }
    },
    side: THREE.BackSide,
    depthWrite: true,
  });

  const outlineMesh = new THREE.Mesh(originalMesh.geometry.clone(), outlineMaterial);
  outlineMesh.renderOrder = -1;

  return outlineMesh;
}
```

### Code: Screen-Space Outline Pass (PostProcessing.js)

Add this to the post-processing pipeline for guaranteed outlines on everything:

```javascript
/**
 * Edge detection outline shader
 * Creates consistent outlines from screen-space depth/normal discontinuities
 */
const EdgeOutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2() },
    outlineColor: { value: new THREE.Color(0x2A2A2A) },
    outlineThickness: { value: 1.5 },
    depthThreshold: { value: 0.001 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform vec3 outlineColor;
    uniform float outlineThickness;
    uniform float depthThreshold;

    varying vec2 vUv;

    float getDepth(vec2 uv) {
      return texture2D(tDepth, uv).r;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Sample depth in a cross pattern
      vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y) * outlineThickness;

      float depth = getDepth(vUv);
      float depthN = getDepth(vUv + vec2(0.0, texel.y));
      float depthS = getDepth(vUv - vec2(0.0, texel.y));
      float depthE = getDepth(vUv + vec2(texel.x, 0.0));
      float depthW = getDepth(vUv - vec2(texel.x, 0.0));

      // Calculate edge strength from depth discontinuity
      float edge = 0.0;
      edge += step(depthThreshold, abs(depth - depthN));
      edge += step(depthThreshold, abs(depth - depthS));
      edge += step(depthThreshold, abs(depth - depthE));
      edge += step(depthThreshold, abs(depth - depthW));

      edge = clamp(edge, 0.0, 1.0);

      // Mix outline color with original color
      gl_FragColor = vec4(mix(color.rgb, outlineColor, edge * 0.8), color.a);
    }
  `
};

// Add to PostProcessing setup:
setupEdgeOutlinePass(renderer, scene, camera) {
  // Need depth texture
  const depthTexture = new THREE.DepthTexture();
  depthTexture.type = THREE.UnsignedShortType;

  const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      depthTexture: depthTexture,
      depthBuffer: true,
    }
  );

  const outlinePass = new ShaderPass(EdgeOutlineShader);
  outlinePass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  outlinePass.uniforms.tDepth.value = depthTexture;

  this.composer.addPass(outlinePass);

  return { renderTarget, outlinePass };
}
```

### Code: Add Outlines to All Props in Planet.js

Ensure every prop has an outline. Update these functions:

```javascript
// In createTree()
createTree(lat, lon) {
  // ... existing code ...

  // Tree trunk outline
  const trunkOutline = createOutlineMesh(trunk, 0.03);
  trunkOutline.position.copy(trunkPos);
  trunkOutline.quaternion.copy(orientation);
  this.scene.add(trunkOutline);
  this.meshes.push(trunkOutline);

  // Foliage outline (already exists, ensure thickness is 0.04+)
  const foliageOutline = createOutlineMesh(foliage, 0.05);
  // ... rest of code
}

// In createBench()
createBench(lat, lon) {
  // ... existing code ...

  // Add outline to seat
  const seatOutline = createOutlineMesh(seat, 0.025);
  seatOutline.position.copy(seatPos);
  seatOutline.quaternion.copy(orientation);
  this.scene.add(seatOutline);
  this.meshes.push(seatOutline);
}

// In createStreetLight()
createStreetLight(lat, lon) {
  // ... existing code ...

  // Pole outline
  const poleOutline = createOutlineMesh(pole, 0.02);
  poleOutline.position.copy(polePos);
  poleOutline.quaternion.copy(orientation);
  this.scene.add(poleOutline);
  this.meshes.push(poleOutline);
}
```

### Code: Planet Silhouette Outline

Add a thick outline to the planet sphere for the iconic "tiny planet" silhouette:

```javascript
// In createPlanetSphere()
createPlanetSphere() {
  // ... existing sphere code ...

  // THICK planet outline for silhouette effect
  const planetOutline = createThickOutlineMesh(planetMesh, 0.15);
  this.scene.add(planetOutline);
  this.meshes.push(planetOutline);
}
```

### Code: Character Outline Update in Player.js

Increase character outline thickness for better visibility:

```javascript
// Update these outline calls in Player.js createMesh():

// Head outline - increase from 0.012 to 0.015
const headOutline = createOutlineMesh(head, 0.015);

// Hair outline - increase from 0.01 to 0.012
const hairOutline = createOutlineMesh(hair, 0.012);

// Torso outline - increase from 0.01 to 0.015
const torsoOutline = createOutlineMesh(upperTorso, 0.015);

// Skirt outline - increase from 0.008 to 0.012
const skirtOutline = createOutlineMesh(skirt, 0.012);

// Bag outline - increase from 0.008 to 0.01
const bagOutline = createOutlineMesh(bagBody, 0.01);

// Foot outlines - increase from 0.006 to 0.008
const leftFootOutline = createOutlineMesh(leftFoot, 0.008);
const rightFootOutline = createOutlineMesh(rightFoot, 0.008);
```

---

## Web Resources & References

### Visual Style References
- **messenger.abeto.co** - The primary reference
- **Katamari Damacy** - Similar tiny planet aesthetic
- **Animal Crossing** - Cel-shaded character style
- **Studio Ghibli films** - Soft cel-shading with blue-gray shadows

### Technical References
- Three.js Toon Shading: https://threejs.org/examples/#webgl_materials_toon
- Outline Shaders: https://threejs.org/examples/#webgl_postprocessing_outline
- Cel Shading Tutorial: https://roystan.net/articles/toon-shader/

### Asset Resources (Free)
- **Kenney Assets**: https://kenney.nl/assets (CC0 low-poly models)
- **Quaternius**: https://quaternius.com/ (Free low-poly packs)
- **Sketchfab**: https://sketchfab.com/search?features=downloadable&type=models (Filter by CC license)

### Color Palette Tools
- **Coolors**: https://coolors.co/ (Generate palettes)
- **Adobe Color**: https://color.adobe.com/ (Extract from images)

---

## Testing Checklist

After implementing changes, verify:

- [ ] All buildings have visible outlines
- [ ] All props have outlines
- [ ] Character outline is visible but not overpowering
- [ ] Planet silhouette is visible
- [ ] Vending machines glow at night
- [ ] Windows transition from blue (day) to warm (night)
- [ ] No z-fighting between outlines and meshes
- [ ] Performance is still acceptable (60fps desktop, 30fps mobile)

---

## Git Workflow

Each agent should:

1. Pull latest from `claude/review-codebase-VnZZ9`
2. Make changes to their assigned files
3. Test locally with `npm run dev`
4. Commit with descriptive message:
   - Agent 1: `feat: enhance building architecture with detailed facades`
   - Agent 2: `feat: add Japanese vending machines and detailed props`
   - Agent 3: `feat: enhance outline system for graphic novel look`
5. Push to `claude/review-codebase-VnZZ9`

All changes should merge cleanly as they modify different aspects of the codebase.
