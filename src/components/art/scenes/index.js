import idle1 from '../../../assets/ascii/luffy/idle1';
import idle2 from '../../../assets/ascii/luffy/idle2';
import sail1 from '../../../assets/ascii/luffy/sail1';
import sail2 from '../../../assets/ascii/luffy/sail2';
import feast1 from '../../../assets/ascii/luffy/feast1';
import feast2 from '../../../assets/ascii/luffy/feast2';
import gear1 from '../../../assets/ascii/luffy/gear1';
import gear2 from '../../../assets/ascii/luffy/gear2';
import kkg1 from '../../../assets/ascii/luffy/kkg1';
import kkg2 from '../../../assets/ascii/luffy/kkg2';

export const SCENES = [
  {
    id: 'idle',
    name: 'straw hat luffy',
    fps: 1.5,
    durationMs: 9000,
    frames: [idle1, idle2],
  },
  {
    id: 'sail',
    name: 'sailing on the sunny',
    fps: 2,
    durationMs: 9000,
    frames: [sail1, sail2],
  },
  {
    id: 'feast',
    name: 'meat o\'clock',
    fps: 2.5,
    durationMs: 8000,
    frames: [feast1, feast2],
  },
  {
    id: 'gear',
    name: 'gear fourth — boundman',
    fps: 4,
    durationMs: 7000,
    frames: [gear1, gear2],
  },
  {
    id: 'kkg',
    name: 'king kong gun',
    fps: 1,
    durationMs: 7000,
    frames: [kkg1, kkg2],
  },
];
