import React, { useMemo } from 'react';
import { BUILDINGS, BUILDING_TYPES } from '../../../constants/buildings';
import { PLANET_CONFIG } from '../../../constants/planetTheme';

// Import building components
import Workshop from './Workshop';
import ProjectPavilion from './ProjectPavilion';
import RecordStore from './RecordStore';
import Cinema from './Cinema';
import PostOffice from './PostOffice';
import WelcomeArch from './WelcomeArch';

// Map building types to components
const BUILDING_COMPONENTS = {
  [BUILDING_TYPES.WORKSHOP]: Workshop,
  [BUILDING_TYPES.PAVILION]: ProjectPavilion,
  [BUILDING_TYPES.RECORD_STORE]: RecordStore,
  [BUILDING_TYPES.CINEMA]: Cinema,
  [BUILDING_TYPES.POST_OFFICE]: PostOffice,
  [BUILDING_TYPES.WELCOME_ARCH]: WelcomeArch,
};

/**
 * Renders all buildings on the planet surface
 * Positions buildings based on their theta/phi coordinates
 */
export default function BuildingRenderer() {
  const buildings = useMemo(() => {
    return BUILDINGS.map((building) => {
      const BuildingComponent = BUILDING_COMPONENTS[building.type];

      if (!BuildingComponent) {
        console.warn(`No component found for building type: ${building.type}`);
        return null;
      }

      return (
        <BuildingComponent
          key={building.id}
          building={building}
          radius={PLANET_CONFIG.radius}
        />
      );
    }).filter(Boolean);
  }, []);

  return <>{buildings}</>;
}
