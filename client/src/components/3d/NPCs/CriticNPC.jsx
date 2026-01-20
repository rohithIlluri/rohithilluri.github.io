import React from 'react';
import NPC from './NPC';

export default function CriticNPC({ theta, phi }) {
  return (
    <NPC
      npcType="critic"
      theta={theta}
      phi={phi}
      label="Film Buff"
    />
  );
}
