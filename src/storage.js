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
  // Tactic tabs: ataque, defensa, extra
  tactics: {
    ataque: { label: 'Ataque', players: [] },
    defensa: { label: 'Defensa', players: [] },
    extra: { label: 'Pelota Parada', players: [] },
  },
  setpieces: {
    tirosLibres: {
      ejecutan: '',
      cabecean: '',
      defensa: '',
      balance: '',
    },
    corners: {
      ejecutan: '',
      cabecean: '',
      defensa: '',
      balance: '',
    },
  },
  observations: '',
});

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
