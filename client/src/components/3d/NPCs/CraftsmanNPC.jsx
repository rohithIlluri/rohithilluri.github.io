import React from 'react';
import NPC from './NPC';

export default function CraftsmanNPC({ theta, phi }) {
  return (
    <NPC
      npcType="craftsman"
      theta={theta}
      phi={phi}
      label="The Craftsman"
    />
  );
}
