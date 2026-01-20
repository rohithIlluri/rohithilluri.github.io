import React from 'react';
import NPC from './NPC';

export default function PostmasterNPC({ theta, phi }) {
  return (
    <NPC
      npcType="postmaster"
      theta={theta}
      phi={phi}
      label="Postmaster"
    />
  );
}
