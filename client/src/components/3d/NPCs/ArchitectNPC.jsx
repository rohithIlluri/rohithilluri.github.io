import React from 'react';
import NPC from './NPC';

export default function ArchitectNPC({ theta, phi }) {
  return (
    <NPC
      npcType="architect"
      theta={theta}
      phi={phi}
      label="The Architect"
    />
  );
}
