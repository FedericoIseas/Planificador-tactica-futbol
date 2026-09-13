// storage.js — helpers for LocalStorage persistence

const STORAGE_KEY = 'ftactico_data';

export const DEFAULT_SQUAD = [
  { id: 'p1', name: 'ORTUETA R', number: 1 },
  { id: 'p2', name: 'NEGRETE S', number: 2 },
  { id: 'p3', name: 'BAUZA S', number: 3 },
  { id: 'p4', name: 'HERRERA M', number: 4 },
  { id: 'p5', name: 'HERRERA R', number: 5 },
  { id: 'p6', name: 'SOLIS T', number: 6 },
  { id: 'p7', name: 'BEGUERIE S', number: 7 },
  { id: 'p8', name: 'DALMAS C', number: 8 },
  { id: 'p9', name: 'MANSILLA M', number: 9 },
  { id: 'p10', name: 'MORALES M', number: 10 },
  { id: 'p11', name: 'LUCERO L', number: 11 },
];

export const createMatch = (label = 'Nuevo partido') => ({
  id: `match_${Date.now()}`,
  label,
  date: '',
  time: '',
  venue: '',
  rival: '',
  // Tactic tabs: ataque, defensa, and set pieces
  tactics: {
    ataque: { label: 'Ataque', players: [], observations: '' },
    defensa: { label: 'Defensa', players: [], observations: '' },
    tiros_libres: { label: 'Tiros Libres', players: [], observations: '' },
    corners: { label: 'Corners', players: [], observations: '' },
  },
  setpieces: {
    tiros_libres: { ejecutan: '', cabecean: '', defensa: '', balance: '' },
    corners: { ejecutan: '', cabecean: '', defensa: '', balance: '' },
  },
  observations: '',
});

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.matches)) {
      data.matches = data.matches.map(m => {
        let tactics = { ...m.tactics };
        if (tactics.extra || tactics.tl_izq) {
          delete tactics.extra;
          delete tactics.tl_izq;
          delete tactics.tl_der;
          delete tactics.corner_izq;
          delete tactics.corner_der;
          if (!tactics.tiros_libres) tactics.tiros_libres = { label: 'Tiros Libres', players: [] };
          if (!tactics.corners) tactics.corners = { label: 'Corners', players: [] };
        }

        let setpieces = { ...m.setpieces };
        if (setpieces.tirosLibres || setpieces.corners || setpieces.tl_izq) {
          const oldTL = setpieces.tirosLibres || setpieces.tl_izq || {};
          const oldCorner = setpieces.corners || setpieces.corner_izq || {};

          if (!setpieces.tiros_libres) setpieces.tiros_libres = { ejecutan: oldTL.ejecutan || '', cabecean: oldTL.cabecean || '', defensa: oldTL.defensa || '', balance: oldTL.balance || '' };
          if (!setpieces.corners) setpieces.corners = { ejecutan: oldCorner.ejecutan || '', cabecean: oldCorner.cabecean || '', defensa: oldCorner.defensa || '', balance: oldCorner.balance || '' };

          delete setpieces.tirosLibres;
          delete setpieces.corners;
          delete setpieces.tl_izq;
          delete setpieces.tl_der;
          delete setpieces.corner_izq;
          delete setpieces.corner_der;
        }

        if (m.observations !== undefined) {
          if (tactics.ataque && tactics.ataque.observations === undefined) {
            tactics.ataque.observations = m.observations;
            tactics.defensa.observations = '';
            tactics.tiros_libres.observations = '';
            tactics.corners.observations = '';
          }
          delete m.observations;
        }

        return { ...m, tactics, setpieces };
      });
    }
    return data;
  } catch {
    return null;
  }
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
