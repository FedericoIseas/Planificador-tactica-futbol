import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PrintableBoard from './components/PrintableBoard.jsx';
import { DEFAULT_SQUAD, createMatch, loadData, saveData } from './storage.js';

const PRINT_SECTIONS = [
  { key: 'ataque', label: 'Ataque', icon: '⚔️' },
  { key: 'defensa', label: 'Defensa', icon: '🛡️' },
  { key: 'tiros_libres', label: 'Tiros Libres', icon: '🎯' },
  { key: 'corners', label: 'Corners', icon: '🚩' },
];

function PrintSectionsModal({ onConfirm, onCancel }) {
  const [selected, setSelected] = useState({ ataque: true, defensa: true, tiros_libres: true, corners: true });

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
  const [printSections, setPrintSections] = useState({ ataque: true, defensa: true, tiros_libres: true, corners: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
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
    setShowMobileActions(false);
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
    setShowMobileActions(false);
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
    if (selectedPlayerId === playerId) setSelectedPlayerId(null);
    setState(prev => ({
      ...prev,
      squad: prev.squad.filter(p => p.id !== playerId),
      matches: prev.matches.map(match => {
        const nextTactics = { ...match.tactics };
        Object.keys(nextTactics).forEach(key => {
          ['players', 'players_izq', 'players_der'].forEach(subKey => {
            if (nextTactics[key]?.[subKey]) {
              nextTactics[key] = {
                ...nextTactics[key],
                [subKey]: nextTactics[key][subKey].filter(p => p.id !== playerId),
              };
            }
          });
        });
        return { ...match, tactics: nextTactics };
      }),
    }));
  };

  const handleDropOnPitch = (playerId, x, y, tacticKey, subKey = 'players') => {
    const playerObj = state.squad.find(p => p.id === playerId);
    if (!playerObj || !activeMatch) return;

    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];
    if (currentPlayers.some(p => p.id === playerId)) return;

    const newPlacedPlayer = { ...playerObj, x, y };
    
    let updatedTactics = { ...activeMatch.tactics };
    
    if (tacticKey === 'ataque' || tacticKey === 'defensa') {
      const otherKey = tacticKey === 'ataque' ? 'defensa' : 'ataque';
      const otherPlayers = updatedTactics[otherKey]?.[subKey] || [];
      if (!otherPlayers.some(p => p.id === playerId)) {
        updatedTactics[otherKey] = {
          ...updatedTactics[otherKey],
          [subKey]: [...otherPlayers, newPlacedPlayer],
        };
      }
    }

    updatedTactics[tacticKey] = {
      ...updatedTactics[tacticKey],
      [subKey]: [...currentPlayers, newPlacedPlayer],
    };

    const updatedMatch = { ...activeMatch, tactics: updatedTactics };
    handleUpdateMatch(updatedMatch);
    setSelectedPlayerId(null);
  };

  const handlePlayerMove = (playerId, x, y, tacticKey, subKey = 'players') => {
    if (!activeMatch) return;
    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];
    const updatedPlayers = currentPlayers.map(p => p.id === playerId ? { ...p, x, y } : p);

    const updatedMatch = {
      ...activeMatch,
      tactics: {
        ...activeMatch.tactics,
        [tacticKey]: {
          ...activeMatch.tactics[tacticKey],
          [subKey]: updatedPlayers,
        },
      },
    };
    handleUpdateMatch(updatedMatch);
  };

  const handlePlayerRemoveFromPitch = (playerId, tacticKey, subKey = 'players') => {
    if (!activeMatch) return;
    
    let updatedTactics = { ...activeMatch.tactics };

    if (tacticKey === 'ataque' || tacticKey === 'defensa') {
      Object.keys(updatedTactics).forEach(key => {
        ['players', 'players_izq', 'players_der'].forEach(sKey => {
          if (updatedTactics[key]?.[sKey]) {
            updatedTactics[key] = {
              ...updatedTactics[key],
              [sKey]: updatedTactics[key][sKey].filter(p => p.id !== playerId),
            };
          }
        });
      });
    } else {
      const currentPlayers = updatedTactics[tacticKey]?.[subKey] || [];
      updatedTactics[tacticKey] = {
        ...updatedTactics[tacticKey],
        [subKey]: currentPlayers.filter(p => p.id !== playerId),
      };
    }

    const updatedMatch = { ...activeMatch, tactics: updatedTactics };
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

  const displaySquad = activeTactic === 'ataque' || activeTactic === 'defensa'
    ? state.squad
    : state.squad.filter(p => activeMatch?.tactics?.['ataque']?.players?.some(ap => ap.id === p.id));

  return (
    <div className="app-layout">
      {/* Top Header Bar / Toolbar */}
      <header className="toolbar no-print">
        {/* Mobile Squad Toggle Button */}
        <button
          className="btn btn-sidebar-toggle no-print"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          title="Abrir plantilla de jugadores"
          aria-label="Abrir plantilla"
        >
          <span>📋</span>
          <span className="sidebar-toggle-text">Plantilla</span>
          <span className="sidebar-toggle-badge">{state.squad.length}</span>
        </button>

        <div className="toolbar-brand">
          <div className="toolbar-brand-badge">⚽</div>
          <span className="toolbar-brand-text">PLANIFICADOR TÁCTICO</span>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-matches-section">
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
              className="btn btn-ghost btn-new-match"
              onClick={handleNewMatch}
              title="Agregar nueva fecha"
            >
              + Nueva Fecha
            </button>
          </div>
        </div>

        <div className="toolbar-spacer" />

        {/* Desktop Actions */}
        <div className="toolbar-desktop-actions">
          <button className="btn btn-ghost" onClick={handleExport} title="Exportar backup JSON">
            <span>⬇</span>
            <span>Exportar</span>
          </button>
          <button className="btn btn-ghost" onClick={() => importRef.current?.click()} title="Cargar backup JSON">
            <span>⬆</span>
            <span>Importar</span>
          </button>
        </div>

        {/* Mobile Actions Menu Toggle */}
        <div className="toolbar-mobile-actions-wrapper">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowMobileActions(prev => !prev)}
            title="Más opciones"
            aria-label="Opciones"
          >
            ⚙️
          </button>

          {showMobileActions && (
            <div className="mobile-actions-menu">
              <button className="mobile-action-item" onClick={handleNewMatch}>
                <span>➕</span>
                <span>Nueva Fecha</span>
              </button>
              <button className="mobile-action-item" onClick={handleExport}>
                <span>⬇️</span>
                <span>Exportar Backup (JSON)</span>
              </button>
              <button className="mobile-action-item" onClick={() => { setShowMobileActions(false); importRef.current?.click(); }}>
                <span>⬆️</span>
                <span>Importar Backup (JSON)</span>
              </button>
            </div>
          )}
        </div>

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
          <span className="btn-print-text">Imprimir</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="app-body">
        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop no-print"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          squad={displaySquad}
          fieldPlayerIds={fieldPlayerIds}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayerFromSquad}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayerForPlacement={setSelectedPlayerId}
        />

        {activeMatch && (
          <main className="main-content">
            <PrintableBoard
              match={activeMatch}
              squad={displaySquad}
              activeTactic={activeTactic}
              onTacticChange={setActiveTactic}
              onMatchChange={handleUpdateMatch}
              onDrop={handleDropOnPitch}
              onPlayerMove={handlePlayerMove}
              onPlayerRemove={handlePlayerRemoveFromPitch}
              onDeleteMatch={() => handleDeleteMatch(activeMatch.id)}
              canDeleteMatch={state.matches.length > 1}
              printSections={printSections}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayerForPlacement={setSelectedPlayerId}
              onClearSelectedPlayer={() => setSelectedPlayerId(null)}
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
