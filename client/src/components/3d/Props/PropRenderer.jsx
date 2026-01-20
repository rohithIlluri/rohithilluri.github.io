import React, { useMemo } from 'react';
import { BUILDINGS } from '../../../constants/buildings';
import { NPC_DIALOGUES } from '../../../constants/dialogues';
import { PLANET_CONFIG } from '../../../constants/planetTheme';
import { TREES, BENCHES, SIGNS, BUSHES } from '../../../constants/environmentProps';

// Import content prop components
import SkillDisplay from './SkillDisplay';
import ProjectBillboard from './ProjectBillboard';
import VinylWall from './VinylWall';
import PosterFrame from './PosterFrame';
import MailboxDisplay from './MailboxDisplay';

// Import environment prop components
import Tree from './Tree';
import Bench from './Bench';
import Sign from './Sign';
import Bush from './Bush';

// Get content data for a building based on its content type
function getContentData(contentType) {
  const npcMap = {
    skills: 'craftsman',
    projects: 'architect',
    music: 'musician',
    movies: 'critic',
    contact: 'postmaster',
  };

  const npcId = npcMap[contentType];
  if (!npcId) return null;

  const npcData = NPC_DIALOGUES[npcId];
  if (!npcData) return null;

  // Find the content message in dialogues
  const contentMessage = npcData.dialogues.find((d) => d.type === contentType);
  return contentMessage?.data || null;
}

/**
 * Renders content displays around buildings
 */
export default function PropRenderer() {
  const props = useMemo(() => {
    const elements = [];

    BUILDINGS.forEach((building) => {
      if (!building.contentType) return;

      const contentData = getContentData(building.contentType);
      if (!contentData) return;

      const key = `prop-${building.id}`;
      const commonProps = {
        building,
        radius: PLANET_CONFIG.radius,
        data: contentData,
      };

      switch (building.contentType) {
        case 'skills':
          elements.push(<SkillDisplay key={key} {...commonProps} />);
          break;
        case 'projects':
          elements.push(<ProjectBillboard key={key} {...commonProps} />);
          break;
        case 'music':
          elements.push(<VinylWall key={key} {...commonProps} />);
          break;
        case 'movies':
          elements.push(<PosterFrame key={key} {...commonProps} />);
          break;
        case 'contact':
          elements.push(<MailboxDisplay key={key} {...commonProps} />);
          break;
        default:
          break;
      }
    });

    return elements;
  }, []);

  // Render environment props
  const environmentProps = useMemo(() => {
    const radius = PLANET_CONFIG.radius;

    return (
      <>
        {/* Trees */}
        {TREES.map((tree) => (
          <Tree
            key={tree.id}
            theta={tree.theta * Math.PI}
            phi={tree.phi}
            radius={radius}
            scale={tree.scale}
          />
        ))}

        {/* Benches */}
        {BENCHES.map((bench) => (
          <Bench
            key={bench.id}
            theta={bench.theta * Math.PI}
            phi={bench.phi}
            radius={radius}
            rotation={bench.rotation}
          />
        ))}

        {/* Signs */}
        {SIGNS.map((sign) => (
          <Sign
            key={sign.id}
            theta={sign.theta}
            phi={sign.phi}
            radius={radius}
            rotation={sign.rotation}
            color={sign.color}
            arrowColor={sign.arrowColor}
          />
        ))}

        {/* Bushes */}
        {BUSHES.map((bush) => (
          <Bush
            key={bush.id}
            theta={bush.theta * Math.PI}
            phi={bush.phi}
            radius={radius}
            scale={bush.scale}
            color={bush.color}
          />
        ))}
      </>
    );
  }, []);

  return (
    <>
      {/* Content props (building displays) */}
      {props}

      {/* Environment props (trees, benches, signs, bushes) */}
      {environmentProps}
    </>
  );
}
