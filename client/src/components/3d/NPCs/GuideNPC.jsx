import React from 'react';
import NPC from './NPC';

export default function GuideNPC({ theta, phi }) {
  return (
    <NPC
      npcType="guide"
      theta={theta}
      phi={phi}
      label="Guide"
    />
  );
}
