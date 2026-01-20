import React, { useMemo } from 'react';
import { COLLECTIBLES, COLLECTIBLE_TYPES } from '../../../constants/collectibles';
import { PLANET_CONFIG } from '../../../constants/planetTheme';
import { useCollectibles } from '../../../context/CollectiblesContext';

// Import collectible components
import MemoryOrb from './MemoryOrb';
import PhotoFrame from './PhotoFrame';
import Postcard from './Postcard';

// Map collectible types to components
const COLLECTIBLE_COMPONENTS = {
  [COLLECTIBLE_TYPES.MEMORY_ORB]: MemoryOrb,
  [COLLECTIBLE_TYPES.PHOTO_FRAME]: PhotoFrame,
  [COLLECTIBLE_TYPES.POSTCARD]: Postcard,
};

/**
 * Renders all collectibles on the planet surface
 * Only renders uncollected items
 */
export default function CollectibleRenderer() {
  const { isCollected } = useCollectibles();

  const collectibles = useMemo(() => {
    return COLLECTIBLES.map((collectible) => {
      // Skip already collected items
      if (isCollected(collectible.id)) return null;

      const CollectibleComponent = COLLECTIBLE_COMPONENTS[collectible.type];

      if (!CollectibleComponent) {
        console.warn(`No component found for collectible type: ${collectible.type}`);
        return null;
      }

      return (
        <CollectibleComponent
          key={collectible.id}
          collectible={collectible}
          radius={PLANET_CONFIG.radius}
        />
      );
    }).filter(Boolean);
  }, [isCollected]);

  return <>{collectibles}</>;
}
