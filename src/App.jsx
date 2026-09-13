import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PrintableBoard from './components/PrintableBoard.jsx';
import { DEFAULT_SQUAD, createMatch, loadData, saveData } from './storage.js';

const PRINT_SECTIONS = [
  { key: 'ataque',  label: 'Ataque',       icon: '⚔️' },
  { key: 'defensa', label: 'Defensa',       icon: '🛡️' },
  { key: 'extra',   label: 'Pelota Parada', icon: '🎯' },
];

function PrintSectionsModal({ onConfirm, onCancel }) {
  const [selected, setSelected] = useState({ ataque: true, defensa: true, extra: true });

  const toggle = (key) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  const anySelected = Object.values(selected).some(Boolean);

  return (
    <div className="print-modal-overlay" onClick={onCancel}>
      <div className="print-modal" onClick={e => e.stopPropagation()}>
        <div className="print-modal-header">
          <span className="print-modal-icon">🖨️</span>
          <div>
            <div className="print-modal-title">Seleccionar secciones a imprimir</div>
            <div className="print-modal-subtitle">Elegí qué páginas incluir en el PDF / impresión</div>
          </div>
        </div>

        <div className="print-modal-options">
          {PRINT_SECTIONS.map(s => (
            <label key={s.key} className={`print-modal-option${selected[s.key] ? ' checked' : ''}`}>
              <input
                type="checkbox"
                checked={selected[s.key]}
                onChange={() => toggle(s.key)}
              />
              <span className="print-modal-option-icon">{s.icon}</span>
              <span className="print-modal-option-label">{s.label}</span>
              {selected[s.key] && <span className="print-modal-check">✓</span>}
            </label>
          ))}
        </div>

        <div className="print-modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn-print"
            disabled={!anySelected}
            onClick={() => onConfirm(selected)}
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitialState() {
  const saved = loadData();
  if (saved && Array.isArray(saved.matches) && saved.matches.length > 0) {
    return {
      squad: saved.squad || DEFAULT_SQUAD,
      matches: saved.matches,
      activeMatchId: saved.activeMatchId || saved.matches[0].id,
    };
  }
  const firstMatch = createMatch('Fecha 1');
  return {
    squad: DEFAULT_SQUAD,
    matches: [firstMatch],
    activeMatchId: firstMatch.id,
  };
}

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [activeTactic, setActiveTactic] = useState('ataque');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSections, setPrintSections] = useState({ ataque: true, defensa: true, extra: true });
  const importRef = useRef(null);

  // Export all data as JSON file
  const handleExport = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planificador_tactico_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import all data from JSON file
  const handleImport = (e) => {
    const file = e.target.files?.[0];
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
  };

  useEffect(() => {
    saveData(state);
  }, [state]);

  const activeMatch = state.matches.find(m => m.id === state.activeMatchId) || state.matches[0];

  const handleSelectMatch = (id) => {
    setState(prev => ({ ...prev, activeMatchId: id }));
  };

  const handleNewMatch = () => {
    const nextNum = state.matches.length + 1;
    const newM = createMatch(`Fecha ${nextNum}`);
    setState(prev => ({
      ...prev,
      matches: [...prev.matches, newM],
      activeMatchId: newM.id,
    }));
  };

  const handleDeleteMatch = (id) => {
    if (state.matches.length <= 1) return;
    const confirmDel = window.confirm('¿Seguro que querés eliminar esta fecha?');
    if (!confirmDel) return;

    setState(prev => {
      const nextMatches = prev.matches.filter(m => m.id !== id);
      const nextActiveId = prev.activeMatchId === id ? nextMatches[0].id : prev.activeMatchId;
      return {
        ...prev,
        matches: nextMatches,
        activeMatchId: nextActiveId,
      };
    });
  };

  const handleUpdateMatch = (updatedMatch) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m),
    }));
  };

  const handleAddPlayer = (name, number) => {
    const newP = {
      id: `p_${Date.now()}`,
      name,
      number: number ? parseInt(number, 10) || number : '',
    };
    setState(prev => ({
      ...prev,
      squad: [...prev.squad, newP],
    }));
  };

  const handleRemovePlayerFromSquad = (playerId) => {
    setState(prev => ({
      ...prev,
      squad: prev.squad.filter(p => p.id !== playerId),
      matches: prev.matches.map(match => {
        const nextTactics = { ...match.tactics };
        Object.keys(nextTactics).forEach(key => {
          if (nextTactics[key]?.players) {
            nextTactics[key] = {
              ...nextTactics[key],
              players: nextTactics[key].players.filter(p => p.id !== playerId),
            };
          }
        });
        return { ...match, tactics: nextTactics };
      }),
    }));
  };

  const handleDropOnPitch = (playerId, x, y, tacticKey) => {
    const playerObj = state.squad.find(p => p.id === playerId);
    if (!playerObj || !activeMatch) return;

    const currentPlayers = activeMatch.tactics[tacticKey]?.players || [];
    if (currentPlayers.some(p => p.id === playerId)) return;

    const newPlacedPlayer = { ...playerObj, x, y };
    const updatedMatch = {
      ...activeMatch,
      tactics: {
        ...activeMatch.tactics,
        [tacticKey]: {
          ...activeMatch.tactics[tacticKey],
          players: [...currentPlayers, newPlacedPlayer],
        },
      },
    };
    handleUpdateMatch(updatedMatch);
  };

  const handlePlayerMove = (playerId, x, y, tacticKey) => {
    if (!activeMatch) return;
    const currentPlayers = activeMatch.tactics[tacticKey]?.players || [];
    const updatedPlayers = currentPlayers.map(p => p.id === playerId ? { ...p, x, y } : p);

    const updatedMatch = {
      ...activeMatch,
      tactics: {
        ...activeMatch.tactics,
        [tacticKey]: {
          ...activeMatch.tactics[tacticKey],
          players: updatedPlayers,
        },
      },
    };
    handleUpdateMatch(updatedMatch);
  };

  const handlePlayerRemoveFromPitch = (playerId, tacticKey) => {
    if (!activeMatch) return;
    const currentPlayers = activeMatch.tactics[tacticKey]?.players || [];
    const updatedPlayers = currentPlayers.filter(p => p.id !== playerId);

    const updatedMatch = {
      ...activeMatch,
      tactics: {
        ...activeMatch.tactics,
        [tacticKey]: {
          ...activeMatch.tactics[tacticKey],
          players: updatedPlayers,
        },
      },
    };
    handleUpdateMatch(updatedMatch);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handlePrintConfirm = (sections) => {
    setPrintSections(sections);
    setShowPrintModal(false);
    // Apply section filter then print
    setTimeout(() => {
      window.print();
    }, 80);
  };

  const fieldPlayerIds = new Set(
    (activeMatch?.tactics?.[activeTactic]?.players || []).map(p => p.id)
  );

  return (
    <div className="app-layout">
      {/* Top Header Bar / Toolbar */}
      <header className="toolbar no-print">
        <div className="toolbar-brand">
          <div className="toolbar-brand-badge">⚽</div>
          <span>PLANIFICADOR TÁCTICO</span>
        </div>

        <div className="toolbar-divider" />

        <span className="toolbar-label">FECHAS:</span>

        <div className="toolbar-matches">
          {state.matches.map(m => (
            <button
              key={m.id}
              className={`btn btn-match${m.id === state.activeMatchId ? ' active' : ''}`}
              onClick={() => handleSelectMatch(m.id)}
            >
              {m.label || 'Fecha'}{m.rival ? ` (${m.rival})` : ''}
            </button>
          ))}
          <button
            className="btn btn-ghost"
            onClick={handleNewMatch}
            title="Agregar nueva fecha"
          >
            + Nueva Fecha
          </button>
        </div>

        <div className="toolbar-spacer" />

        <button className="btn btn-ghost" onClick={handleExport} title="Exportar backup JSON">
          <span>⬇</span>
          <span>Exportar</span>
        </button>
        <button className="btn btn-ghost" onClick={() => importRef.current?.click()} title="Cargar backup JSON">
          <span>⬆</span>
          <span>Importar</span>
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />

        <div className="toolbar-divider" />

        <button className="btn btn-print" onClick={handlePrint} title="Imprimir o guardar PDF">
          <span>🖨️</span>
          <span>Imprimir</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="app-body">
        <Sidebar
          squad={state.squad}
          fieldPlayerIds={fieldPlayerIds}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayerFromSquad}
        />

        {activeMatch && (
          <main className="main-content">
            <PrintableBoard
              match={activeMatch}
              squad={state.squad}
              activeTactic={activeTactic}
              onTacticChange={setActiveTactic}
              onMatchChange={handleUpdateMatch}
              onDrop={handleDropOnPitch}
              onPlayerMove={handlePlayerMove}
              onPlayerRemove={handlePlayerRemoveFromPitch}
              onDeleteMatch={() => handleDeleteMatch(activeMatch.id)}
              canDeleteMatch={state.matches.length > 1}
              printSections={printSections}
            />
          </main>
        )}
      </div>

      {/* Print Section Selection Modal */}
      {showPrintModal && (
        <PrintSectionsModal
          onConfirm={handlePrintConfirm}
          onCancel={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
