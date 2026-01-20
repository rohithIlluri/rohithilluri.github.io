import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PlanetProvider, usePlanet } from '../../context/PlanetContext';
import { MessengerProvider, useMessenger } from '../../context/MessengerContext';
import { WorldProvider, useWorld } from '../../context/WorldContext';
import { CollectiblesProvider } from '../../context/CollectiblesContext';
import { PLANET_COLORS, LANDMARKS } from '../../constants/planetTheme';
import useZoneDetection from '../../hooks/useZoneDetection';

// Planet components
import TinyPlanet from './Planet/TinyPlanet';
import PlanetSky from './Environment/PlanetSky';
import SphereAvatar from './Character/SphereAvatar';
import PlanetCameraRig from './Camera/PlanetCameraRig';
import PostProcessingStack from './Effects/PostProcessingStack';

// Building components
import BuildingRenderer from './Buildings/BuildingRenderer';

// Props components
import PropRenderer from './Props/PropRenderer';

// Collectibles components
import CollectibleRenderer from './Collectibles/CollectibleRenderer';

// NPC components
import NPC from './NPCs/NPC';

// UI components
import MinimalOverlay from './UI/MinimalOverlay';
import InteractionPrompt from './UI/InteractionPrompt';
import PlanetLoadingScreen from './UI/PlanetLoadingScreen';
import MessengerDialogue from './UI/MessengerDialogue';
import FloatingControls from './UI/FloatingControls';
import ZoneIndicator from './UI/ZoneIndicator';
import CollectionProgress from './UI/CollectionProgress';

// NPC Renderer - renders all NPCs from landmarks config
function NPCRenderer() {
  const npcs = useMemo(() => {
    return LANDMARKS.filter((landmark) => landmark.type === 'npc').map((landmark) => (
      <NPC
        key={landmark.id}
        npcType={landmark.npcType}
        theta={landmark.theta}
        phi={landmark.phi}
        label={landmark.label}
      />
    ));
  }, []);

  return <>{npcs}</>;
}

// Zone tracker - updates world context when player moves between zones
function ZoneTracker() {
  const { characterPosition } = usePlanet();
  const { updateZoneFromTheta } = useWorld();
  const { getZoneFromPosition } = useZoneDetection();

  useEffect(() => {
    if (characterPosition) {
      const zone = getZoneFromPosition(characterPosition);
      if (zone) {
        updateZoneFromTheta(zone.thetaStart + 0.1); // Use theta from zone
      }
    }
  }, [characterPosition, getZoneFromPosition, updateZoneFromTheta]);

  return null;
}

// Intro dialogue trigger
function IntroTrigger() {
  const { isLoaded } = usePlanet();
  const { startDialogue, hasSeenIntro, markIntroSeen } = useMessenger();

  useEffect(() => {
    if (isLoaded && !hasSeenIntro) {
      // Small delay to let user see the planet first
      const timer = setTimeout(() => {
        startDialogue('guide');
        markIntroSeen();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasSeenIntro, startDialogue, markIntroSeen]);

  return null;
}

// Scene content
function SceneContent() {
  return (
    <>
      {/* Environment */}
      <PlanetSky />

      {/* Lighting */}
      <ambientLight intensity={0.4} color={PLANET_COLORS.lighting.ambient} />
      <directionalLight
        position={[50, 30, 20]}
        intensity={1.2}
        color={PLANET_COLORS.lighting.directional}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight
        intensity={0.5}
        color={PLANET_COLORS.lighting.hemisphere.sky}
        groundColor={PLANET_COLORS.lighting.hemisphere.ground}
      />

      {/* Rim light for Messenger aesthetic depth */}
      <directionalLight
        position={[-30, 20, -30]}
        intensity={0.3}
        color="#98D8C8"
      />

      {/* The Planet */}
      <TinyPlanet />

      {/* Buildings */}
      <BuildingRenderer />

      {/* Content Props */}
      <PropRenderer />

      {/* Collectibles */}
      <CollectibleRenderer />

      {/* NPCs */}
      <NPCRenderer />

      {/* Character */}
      <SphereAvatar />

      {/* Camera */}
      <PlanetCameraRig />

      {/* Post-processing effects */}
      <PostProcessingStack />
    </>
  );
}

// Main component with all providers
function PlanetSceneContent() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas
        shadows
        camera={{ fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <MinimalOverlay />
      <InteractionPrompt />
      <MessengerDialogue />
      <FloatingControls />
      <ZoneIndicator />
      <CollectionProgress />
      <PlanetLoadingScreen />

      {/* Zone tracking */}
      <ZoneTracker />

      {/* Auto-trigger intro dialogue */}
      <IntroTrigger />
    </div>
  );
}

export default function PlanetScene() {
  return (
    <PlanetProvider>
      <MessengerProvider>
        <WorldProvider>
          <CollectiblesProvider>
            <PlanetSceneContent />
          </CollectiblesProvider>
        </WorldProvider>
      </MessengerProvider>
    </PlanetProvider>
  );
}
