import React from 'react';
import NPC from './NPC';

export default function MusicianNPC({ theta, phi }) {
  return (
    <NPC
      npcType="musician"
      theta={theta}
      phi={phi}
      label="The DJ"
    />
  );
}
