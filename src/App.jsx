import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PrintableBoard from './components/PrintableBoard.jsx';
import { loadData, saveData, DEFAULT_SQUAD, createMatch } from './storage.js';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtMatchDate = (d) => d ? ` · ${d.split('-').slice(1).reverse().join('/')}` : '';

// ── initial state ───────────────────────────────────────────────────────────
const initState = () => {
  const saved = loadData();
  if (saved) return saved;
  const defaultMatch = createMatch('Fecha 1');
  return {
    squad: DEFAULT_SQUAD,
    matches: [defaultMatch],
    activeMatchId: defaultMatch.id,
  };
};

export default function App() {
  const [state, setState] = useState(initState);
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [newMatchLabel, setNewMatchLabel] = useState('');
  const importRef = useRef(null);

  // ── Export all data as JSON file ────────────────────────────────────────
  const handleExport = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planificador_tactico_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  // ── Import from JSON file ───────────────────────────────────────────────
  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.squad || !imported.matches) {
          alert('Archivo inválido: debe ser un export del Planificador Táctico.');
          return;
        }
        setState(imported);
        saveData(imported);
        alert('✅ Datos cargados correctamente.');
      } catch {
        alert('❌ Error al leer el archivo. Asegurate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    saveData(state);
  }, [state]);

  const activeMatch = useMemo(
    () => state.matches.find(m => m.id === state.activeMatchId) || state.matches[0],
    [state.matches, state.activeMatchId]
  );

  // Set of player IDs on ANY tactic in the active match
  const fieldPlayerIds = useMemo(() => {
    if (!activeMatch) return new Set();
    return new Set(
      Object.values(activeMatch.tactics).flatMap(t => (t.players || []).map(p => p.id))
    );
  }, [activeMatch]);

  // ── Squad operations ────────────────────────────────────────────────────
  const handleAddPlayer = useCallback((name, number) => {
    const newPlayer = { id: `p_${Date.now()}`, name, number };
    setState(s => ({ ...s, squad: [...s.squad, newPlayer] }));
  }, []);

  const handleRemovePlayer = useCallback((playerId) => {
    setState(s => ({
      ...s,
      squad: s.squad.filter(p => p.id !== playerId),
      matches: s.matches.map(m => ({
        ...m,
        tactics: Object.fromEntries(
          Object.entries(m.tactics).map(([key, tac]) => [
            key, { ...tac, players: (tac.players || []).filter(p => p.id !== playerId) }
          ])
        ),
      })),
    }));
  }, []);

  // ── Match operations ────────────────────────────────────────────────────
  const handleMatchChange = useCallback((updatedMatch) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m),
    }));
  }, []);

  const handleNewMatch = useCallback(() => {
    const nextNum = state.matches.length + 1;
    const label = `Fecha ${nextNum}`;
    const m = createMatch(label);
    setState(s => ({ ...s, matches: [...s.matches, m], activeMatchId: m.id }));
  }, [state.matches.length]);

  const handleDeleteMatch = useCallback((matchId) => {
    setState(s => {
      const remaining = s.matches.filter(m => m.id !== matchId);
      if (remaining.length === 0) return s;
      return {
        ...s,
        matches: remaining,
        activeMatchId: remaining[remaining.length - 1].id,
      };
    });
  }, []);

  // ── Drag & drop from sidebar ────────────────────────────────────────────
  const handleDrop = useCallback((playerId, x, y, tacticKey) => {
    setState(s => {
      const player = s.squad.find(p => p.id === playerId);
      if (!player) return s;
      return {
        ...s,
        matches: s.matches.map(m => {
          if (m.id !== s.activeMatchId) return m;
          const tac = m.tactics[tacticKey] || { players: [] };
          const alreadyOnThisTactic = tac.players.some(p => p.id === playerId);
          if (alreadyOnThisTactic) return m;
          return {
            ...m,
            tactics: {
              ...m.tactics,
              [tacticKey]: {
                ...tac,
                players: [...tac.players, { id: playerId, name: player.name, number: player.number, x, y }],
              },
            },
          };
        }),
      };
    });
  }, []);

  // ── Move player already on field ────────────────────────────────────────
  const handlePlayerMove = useCallback((playerId, x, y, tacticKey) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => {
        if (m.id !== s.activeMatchId) return m;
        const tac = m.tactics[tacticKey] || { players: [] };
        return {
          ...m,
          tactics: {
            ...m.tactics,
            [tacticKey]: {
              ...tac,
              players: tac.players.map(p => p.id === playerId ? { ...p, x, y } : p),
            },
          },
        };
      }),
    }));
  }, []);

  // ── Remove player from field ────────────────────────────────────────────
  const handlePlayerRemove = useCallback((playerId, tacticKey) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => {
        if (m.id !== s.activeMatchId) return m;
        const tac = m.tactics[tacticKey] || { players: [] };
        return {
          ...m,
          tactics: {
            ...m.tactics,
            [tacticKey]: {
              ...tac,
              players: tac.players.filter(p => p.id !== playerId),
            },
          },
        };
      }),
    }));
  }, []);

  if (!activeMatch) return null;

  return (
    <div className="app-layout">
      {/* ── TOOLBAR ── */}
      <header className="toolbar no-print">
        <div className="toolbar-brand">
          <div className="toolbar-brand-badge">⚽</div>
          <span>Planificador Táctico</span>
        </div>

        <div className="toolbar-divider" />

        <span className="toolbar-label">Fechas:</span>
        <div className="toolbar-matches">
          {state.matches.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <button
                className={`btn btn-match${m.id === state.activeMatchId ? ' active' : ''}`}
                onClick={() => setState(s => ({ ...s, activeMatchId: m.id }))}
              >
                {m.label || 'Partido'}
                {m.rival ? ` (vs ${m.rival.split(' ')[0]})` : ''}
                {fmtMatchDate(m.date)}
              </button>
              {state.matches.length > 1 && (
                <button
                  className="btn btn-danger btn-close"
                  onClick={() => handleDeleteMatch(m.id)}
                  title="Eliminar fecha"
                >×</button>
              )}
            </div>
          ))}
          <button className="btn btn-ghost" onClick={handleNewMatch}>
            + Nueva Fecha
          </button>
        </div>

        <div className="toolbar-spacer" />

        <button className="btn btn-ghost" onClick={handleExport} title="Exportar backup JSON">
          ⬇ Exportar
        </button>
        <button className="btn btn-ghost" onClick={() => importRef.current?.click()} title="Cargar backup JSON">
          ⬆ Importar
        </button>
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

        <div className="toolbar-divider" />

        <button className="btn btn-print" onClick={() => window.print()}>
          🖨 Imprimir A4
        </button>
      </header>

      {/* ── BODY ── */}
      <div className="app-body">
        <Sidebar
          squad={state.squad}
          fieldPlayerIds={fieldPlayerIds}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
        />
        <main className="main-content">
          <PrintableBoard
            match={activeMatch}
            squad={state.squad}
            onMatchChange={handleMatchChange}
            onDrop={handleDrop}
            onPlayerMove={handlePlayerMove}
            onPlayerRemove={handlePlayerRemove}
          />
        </main>
      </div>

      {/* ── MODAL: Nuevo Partido ── */}
      {showNewMatchModal && (
        <div className="modal-overlay" onClick={() => setShowNewMatchModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <span>⚽</span> Crear Nueva Fecha / Partido
            </div>
            <div className="modal-row">
              <span className="modal-label">Etiqueta</span>
              <input
                type="text"
                className="match-header-input"
                placeholder="ej: Fecha 2 — vs Deportivo"
                value={newMatchLabel}
                onChange={e => setNewMatchLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewMatch()}
                style={{ flex: 1 }}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowNewMatchModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleNewMatch}>Crear Fecha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
