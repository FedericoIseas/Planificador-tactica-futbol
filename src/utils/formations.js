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

/**
 * Setpiece Preset Positions (Percentage coordinates for half-pitch 200x146)
 */
export const SETPIECE_POSITIONS = {
  tiros_libres_ataque: [
    { x: 50, y: 88 }, // 1. Ejecutor / Kicker
    { x: 26, y: 35 }, // 2. Rematador 1
    { x: 42, y: 28 }, // 3. Rematador 2
    { x: 58, y: 28 }, // 4. Rematador 3
    { x: 74, y: 35 }, // 5. Rematador 4
    { x: 35, y: 62 }, // 6. Rebote 1
    { x: 65, y: 62 }, // 7. Rebote 2
    { x: 18, y: 85 }, // 8. Cobertura 1
    { x: 82, y: 85 }, // 9. Cobertura 2
    { x: 50, y: 95 }, // 10. Cobertura 3
    { x: 50, y: 15 }, // 11. Arquero / Meta
  ],
  tiros_libres_defensa: [
    { x: 50, y: 10 }, // 1. Arquero
    { x: 38, y: 62 }, // 2. Barrera 1
    { x: 46, y: 62 }, // 3. Barrera 2
    { x: 54, y: 62 }, // 4. Barrera 3
    { x: 62, y: 62 }, // 5. Barrera 4
    { x: 22, y: 32 }, // 6. Marcador 1
    { x: 36, y: 24 }, // 7. Marcador 2
    { x: 64, y: 24 }, // 8. Marcador 3
    { x: 78, y: 32 }, // 9. Marcador 4
    { x: 50, y: 80 }, // 10. Rebote
    { x: 50, y: 94 }, // 11. Salida / Contra
  ],
  corners_ataque: [
    { x: 6, y: 6 },   // 1. Ejecutor córner
    { x: 25, y: 25 }, // 2. Rematador 1 (primer palo)
    { x: 42, y: 18 }, // 3. Rematador 2 (centro área)
    { x: 58, y: 18 }, // 4. Rematador 3 (área chica)
    { x: 75, y: 25 }, // 5. Rematador 4 (segundo palo)
    { x: 32, y: 48 }, // 6. Rematador 5 (punto penal)
    { x: 22, y: 65 }, // 7. Opción corto
    { x: 68, y: 65 }, // 8. Rebote
    { x: 20, y: 88 }, // 9. Cobertura 1
    { x: 50, y: 92 }, // 10. Cobertura 2
    { x: 80, y: 88 }, // 11. Cobertura 3
  ],
  corners_defensa: [
    { x: 50, y: 8 },  // 1. Arquero
    { x: 25, y: 14 }, // 2. Primer palo
    { x: 75, y: 14 }, // 3. Segundo palo
    { x: 30, y: 32 }, // 4. Marca 1
    { x: 42, y: 25 }, // 5. Marca 2
    { x: 58, y: 25 }, // 6. Marca 3
    { x: 70, y: 32 }, // 7. Marca 4
    { x: 50, y: 45 }, // 8. Zonal
    { x: 30, y: 65 }, // 9. Rechazo 1
    { x: 70, y: 65 }, // 10. Rechazo 2
    { x: 50, y: 90 }, // 11. Salida / Contra
  ],
};
