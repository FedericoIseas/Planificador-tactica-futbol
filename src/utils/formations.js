/**
 * Tactical Formation Presets for Full Pitch (Ataque / Defensa)
 * Positions expressed in percentage (x: 0..100, y: 0..100)
 */
export const FORMATIONS = [
  {
    key: '4-3-3',
    label: '4-3-3',
    positions: [
      { x: 50, y: 91 }, // GK
      { x: 86, y: 74 }, // RB
      { x: 63, y: 77 }, // RCB
      { x: 37, y: 77 }, // LCB
      { x: 14, y: 74 }, // LB
      { x: 50, y: 58 }, // CDM
      { x: 70, y: 48 }, // RCM
      { x: 30, y: 48 }, // LCM
      { x: 84, y: 22 }, // RW
      { x: 50, y: 18 }, // ST
      { x: 16, y: 22 }, // LW
    ],
  },
  {
    key: '4-4-2',
    label: '4-4-2',
    positions: [
      { x: 50, y: 91 }, // GK
      { x: 86, y: 74 }, // RB
      { x: 63, y: 77 }, // RCB
      { x: 37, y: 77 }, // LCB
      { x: 14, y: 74 }, // LB
      { x: 85, y: 48 }, // RM
      { x: 62, y: 52 }, // RCM
      { x: 38, y: 52 }, // LCM
      { x: 15, y: 48 }, // LM
      { x: 62, y: 20 }, // RST
      { x: 38, y: 20 }, // LST
    ],
  },
  {
    key: '4-2-3-1',
    label: '4-2-3-1',
    positions: [
      { x: 50, y: 91 }, // GK
      { x: 86, y: 74 }, // RB
      { x: 63, y: 77 }, // RCB
      { x: 37, y: 77 }, // LCB
      { x: 14, y: 74 }, // LB
      { x: 63, y: 60 }, // RCDM
      { x: 37, y: 60 }, // LCDM
      { x: 82, y: 38 }, // RAM
      { x: 50, y: 36 }, // CAM
      { x: 18, y: 38 }, // LAM
      { x: 50, y: 18 }, // ST
    ],
  },
  {
    key: '3-5-2',
    label: '3-5-2',
    positions: [
      { x: 50, y: 91 }, // GK
      { x: 74, y: 77 }, // RCB
      { x: 50, y: 79 }, // CB
      { x: 26, y: 77 }, // LCB
      { x: 88, y: 50 }, // RWB
      { x: 12, y: 50 }, // LWB
      { x: 50, y: 62 }, // CDM
      { x: 68, y: 46 }, // RCM
      { x: 32, y: 46 }, // LCM
      { x: 63, y: 20 }, // RST
      { x: 37, y: 20 }, // LST
    ],
  },
  {
    key: '5-3-2',
    label: '5-3-2',
    positions: [
      { x: 50, y: 91 }, // GK
      { x: 88, y: 72 }, // RB
      { x: 68, y: 78 }, // RCB
      { x: 50, y: 80 }, // CB
      { x: 32, y: 78 }, // LCB
      { x: 12, y: 72 }, // LB
      { x: 50, y: 58 }, // CDM
      { x: 70, y: 48 }, // RCM
      { x: 30, y: 48 }, // LCM
      { x: 62, y: 20 }, // RST
      { x: 38, y: 20 }, // LST
    ],
  },
];

/**
 * Maps current placed players on pitch to the selected formation coordinates.
 */
export function applyFormationToPlayers(players, formationKey) {
  const formation = FORMATIONS.find(f => f.key === formationKey);
  if (!formation || !Array.isArray(players)) return players;

  return players.map((player, index) => {
    if (index < formation.positions.length) {
      const pos = formation.positions[index];
      return { ...player, x: pos.x, y: pos.y };
    }
    return player;
  });
}
