import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PrintableBoard from './components/PrintableBoard.jsx';
import CallUpModal from './components/CallUpModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import Toast from './components/Toast.jsx';
import { DEFAULT_SQUAD, createMatch, loadData, saveData } from './storage.js';
import { generateTacticalPdf } from './utils/pdfGenerator.js';
import { FORMATIONS, applyFormationToPlayers } from './utils/formations.js';
import {
  IconPrinter,
  IconPdf,
  IconSword,
  IconShield,
  IconTarget,
  IconFlag,
  IconTrash,
} from './components/Icons.jsx';

const PRINT_SECTIONS = [
  { key: 'ataque', label: 'Ataque', icon: <IconSword size={18} /> },
  { key: 'defensa', label: 'Defensa', icon: <IconShield size={18} /> },
  { key: 'tiros_libres', label: 'Tiros Libres', icon: <IconTarget size={18} /> },
  { key: 'corners', label: 'Corners', icon: <IconFlag size={18} /> },
];

function PrintSectionsModal({ onConfirm, onCancel }) {
  const [selected, setSelected] = useState({ ataque: true, defensa: true, tiros_libres: true, corners: true });

  const toggle = (key) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  const anySelected = Object.values(selected).some(Boolean);

  return (
    <div className="print-modal-overlay" onClick={onCancel}>
      <div className="print-modal" onClick={e => e.stopPropagation()}>
        <div className="print-modal-header">
          <span className="print-modal-icon">
            <IconPrinter size={24} />
          </span>
          <div>
            <div className="print-modal-title">Exportar o Imprimir Secciones</div>
            <div className="print-modal-subtitle">Elegí qué páginas incluir en el PDF o impresión</div>
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
            className="btn btn-secondary"
            disabled={!anySelected}
            onClick={() => onConfirm(selected, 'pdf')}
            title="Descargar archivo PDF de alta definición"
          >
            <IconPdf size={16} /> Descargar PDF
          </button>
          <button
            className="btn btn-print"
            disabled={!anySelected}
            onClick={() => onConfirm(selected, 'print')}
            title="Imprimir diálogo del navegador"
          >
            <IconPrinter size={16} /> Imprimir
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

function fmtDate(d) {
  return d ? d.split('-').reverse().join('/') : '';
}

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [activeTactic, setActiveTactic] = useState('ataque');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCallUpModal, setShowCallUpModal] = useState(null); // 'new' | 'edit' | null
  const [printSections, setPrintSections] = useState({ ataque: true, defensa: true, tiros_libres: true, corners: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  // Match Selector Dropdown State
  const [isMatchDropdownOpen, setIsMatchDropdownOpen] = useState(false);
  const [matchSearchQuery, setMatchSearchQuery] = useState('');
  const matchDropdownRef = useRef(null);

  // Custom Modal & Toast States (Zero native browser alerts)
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: null,
  });

  const importRef = useRef(null);

  // Click outside to close match dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (matchDropdownRef.current && !matchDropdownRef.current.contains(e.target)) {
        setIsMatchDropdownOpen(false);
      }
    }
    if (isMatchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMatchDropdownOpen]);

  const activeMatchIndex = state.matches.findIndex(m => m.id === state.activeMatchId);
  const hasPrevMatch = activeMatchIndex > 0;
  const hasNextMatch = activeMatchIndex >= 0 && activeMatchIndex < state.matches.length - 1;

  const goToPrevMatch = () => {
    if (hasPrevMatch) {
      handleSelectMatch(state.matches[activeMatchIndex - 1].id);
    }
  };

  const goToNextMatch = () => {
    if (hasNextMatch) {
      handleSelectMatch(state.matches[activeMatchIndex + 1].id);
    }
  };

  const filteredMatches = state.matches.filter(m => {
    if (!matchSearchQuery.trim()) return true;
    const q = matchSearchQuery.toLowerCase();
    return (
      (m.label || '').toLowerCase().includes(q) ||
      (m.rival || '').toLowerCase().includes(q) ||
      (m.venue || '').toLowerCase().includes(q)
    );
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

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
    showToast('Backup JSON exportado correctamente', 'success');
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
          showToast('Archivo inválido: debe ser un export del Planificador Táctico.', 'error');
          return;
        }
        setState(imported);
        saveData(imported);
        showToast('Datos cargados correctamente.', 'success');
      } catch {
        showToast('Error al leer el archivo. Asegurate de que sea un JSON válido.', 'error');
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

  const handleOpenNewMatchModal = () => {
    setShowCallUpModal('new');
    setShowMobileActions(false);
  };

  const handleConfirmNewMatch = (calledUpIds) => {
    const nextNum = state.matches.length + 1;
    const newM = createMatch(`Fecha ${nextNum}`, calledUpIds);
    setState(prev => ({
      ...prev,
      matches: [...prev.matches, newM],
      activeMatchId: newM.id,
    }));
    setShowCallUpModal(null);
    showToast(`Fecha ${nextNum} creada con éxito`, 'success');
  };

  const handleSaveCallUpForActiveMatch = (calledUpIds) => {
    if (!activeMatch) return;
    const calledUpSet = new Set(calledUpIds);

    const updatedMatch = {
      ...activeMatch,
      calledUpIds,
      tactics: Object.keys(activeMatch.tactics).reduce((acc, key) => {
        const tacticObj = activeMatch.tactics[key];
        const nextSubKeys = {};

        ['players', 'players_izq', 'players_der'].forEach(subKey => {
          if (tacticObj[subKey]) {
            nextSubKeys[subKey] = tacticObj[subKey].filter(p => calledUpSet.has(p.id));
          }
        });

        acc[key] = { ...tacticObj, ...nextSubKeys };
        return acc;
      }, {}),
    };

    handleUpdateMatch(updatedMatch);
    setShowCallUpModal(null);
    showToast('Convocatoria actualizada', 'success');
  };

  const handleToggleCallUpForActiveMatch = (playerId) => {
    if (!activeMatch) return;
    const currentCalledUp = activeMatch.calledUpIds || state.squad.map(p => p.id);
    const set = new Set(currentCalledUp);

    if (set.has(playerId)) {
      set.delete(playerId);
    } else {
      set.add(playerId);
    }

    const nextCalledUpIds = Array.from(set);
    handleSaveCallUpForActiveMatch(nextCalledUpIds);
  };

  const handleSetCaptain = (playerId) => {
    if (!activeMatch) return;
    const newCaptainId = activeMatch.captainId === playerId ? null : playerId;
    const updatedMatch = { ...activeMatch, captainId: newCaptainId };
    handleUpdateMatch(updatedMatch);

    const playerObj = state.squad.find(p => p.id === playerId);
    if (newCaptainId) {
      showToast(`Capitán designado: ${playerObj?.name || 'Jugador'} (C)`, 'success');
    } else {
      showToast('Capitanía desmarcada', 'info');
    }
  };

  const handleDeleteMatch = (id) => {
    if (state.matches.length <= 1) return;
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Fecha',
      message: '¿Seguro que querés eliminar esta fecha de partido? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar fecha',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: () => {
        setState(prev => {
          const nextMatches = prev.matches.filter(m => m.id !== id);
          const nextActiveId = prev.activeMatchId === id ? nextMatches[0].id : prev.activeMatchId;
          return {
            ...prev,
            matches: nextMatches,
            activeMatchId: nextActiveId,
          };
        });
        closeConfirmModal();
        showToast('Fecha eliminada', 'info');
      },
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
      matches: prev.matches.map(m => m.id === prev.activeMatchId ? {
        ...m,
        calledUpIds: [...(m.calledUpIds || []), newP.id]
      } : m),
    }));
    showToast(`Jugador ${name} agregado a la plantilla`, 'success');
  };

  const handleRemovePlayerFromSquad = (playerId) => {
    const playerObj = state.squad.find(p => p.id === playerId);
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Jugador',
      message: `¿Seguro que querés eliminar a ${playerObj?.name || 'este jugador'} de la plantilla?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: () => {
        if (selectedPlayerId === playerId) setSelectedPlayerId(null);
        setState(prev => ({
          ...prev,
          squad: prev.squad.filter(p => p.id !== playerId),
          matches: prev.matches.map(match => {
            const nextCalledUpIds = (match.calledUpIds || []).filter(id => id !== playerId);
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
            return {
              ...match,
              calledUpIds: nextCalledUpIds,
              tactics: nextTactics,
              captainId: match.captainId === playerId ? null : match.captainId,
            };
          }),
        }));
        closeConfirmModal();
        showToast('Jugador eliminado de la plantilla', 'info');
      },
    });
  };

  // Drop player from squad onto pitch (with position replace/swap support)
  const handleDropOnPitch = (playerId, x, y, tacticKey, subKey = 'players') => {
    const playerObj = state.squad.find(p => p.id === playerId);
    if (!playerObj || !activeMatch) return;

    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];
    if (currentPlayers.some(p => p.id === playerId)) return;

    // Check proximity to existing placed player (Proximity threshold ~8%)
    const targetPlayer = currentPlayers.find(p => {
      const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
      return dist < 8.0;
    });

    let updatedPlayers;
    let replacedPlayerId = null;

    if (targetPlayer) {
      // Replace target player at target's exact coordinates!
      replacedPlayerId = targetPlayer.id;
      updatedPlayers = currentPlayers.map(p =>
        p.id === targetPlayer.id ? { ...playerObj, x: targetPlayer.x, y: targetPlayer.y } : p
      );
      showToast(`${playerObj.name} reemplazó a ${targetPlayer.name} en cancha`, 'success');
    } else {
      // MAX 11 LIMIT CHECK for full-pitch tactics (ataque/defensa)
      if ((tacticKey === 'ataque' || tacticKey === 'defensa') && currentPlayers.length >= 11) {
        showToast('Titulares completos (11 en cancha). Arrastrá sobre un jugador para reemplazarlo.', 'warning');
        return;
      }
      const newPlacedPlayer = { ...playerObj, x, y };
      updatedPlayers = [...currentPlayers, newPlacedPlayer];
    }

    let updatedTactics = { ...activeMatch.tactics };
    updatedTactics[tacticKey] = {
      ...updatedTactics[tacticKey],
      [subKey]: updatedPlayers,
    };

    // SYNC ATAQUE <-> DEFENSA
    if (tacticKey === 'ataque' || tacticKey === 'defensa') {
      const otherKey = tacticKey === 'ataque' ? 'defensa' : 'ataque';
      let otherPlayers = updatedTactics[otherKey]?.players || [];

      // If a player was replaced, remove replaced player from other phase too
      if (replacedPlayerId) {
        otherPlayers = otherPlayers.filter(p => p.id !== replacedPlayerId);
      }

      // If new player is not in other phase, add them using other phase's formation
      if (!otherPlayers.some(p => p.id === playerId) && otherPlayers.length < 11) {
        const otherFormationKey = updatedTactics[otherKey]?.formation || '4-3-3';
        const formation = FORMATIONS.find(f => f.key === otherFormationKey) || FORMATIONS[0];
        let freePos = null;
        for (let i = 0; i < formation.positions.length; i++) {
          const candidate = formation.positions[i];
          const isOccupied = otherPlayers.some(p => Math.hypot(p.x - candidate.x, p.y - candidate.y) < 5);
          if (!isOccupied) {
            freePos = candidate;
            break;
          }
        }
        if (!freePos) {
          freePos = formation.positions[otherPlayers.length] || { x: 50, y: 50 };
        }
        otherPlayers = [...otherPlayers, { ...playerObj, x: freePos.x, y: freePos.y }];
      }

      updatedTactics[otherKey] = {
        ...updatedTactics[otherKey],
        players: otherPlayers,
      };
    }

    const updatedMatch = { ...activeMatch, tactics: updatedTactics };
    handleUpdateMatch(updatedMatch);
    setSelectedPlayerId(null);
  };

  // Move placed player on pitch (with SWAP support when dropped over another player)
  const handlePlayerMove = (playerId, newX, newY, tacticKey, subKey = 'players', startX = null, startY = null) => {
    if (!activeMatch) return;
    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];

    // Find if moved player lands over another player (Proximity threshold ~8%)
    const targetPlayer = currentPlayers.find(p => {
      if (p.id === playerId) return false;
      const dist = Math.sqrt(Math.pow(p.x - newX, 2) + Math.pow(p.y - newY, 2));
      return dist < 8.0;
    });

    let updatedPlayers;

    if (targetPlayer && startX !== null && startY !== null) {
      // SWAP POSITIONS! Player A gets Target's coords, Target gets Player A's start coords
      updatedPlayers = currentPlayers.map(p => {
        if (p.id === playerId) {
          return { ...p, x: targetPlayer.x, y: targetPlayer.y };
        }
        if (p.id === targetPlayer.id) {
          return { ...p, x: startX, y: startY };
        }
        return p;
      });
      showToast('Posiciones intercambiadas 🔄', 'success');
    } else {
      updatedPlayers = currentPlayers.map(p => p.id === playerId ? { ...p, x: newX, y: newY } : p);
    }

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

  // Quick Tactical Formations handler (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2)
  const handleApplyFormation = (formationKey, tacticKey, subKey = 'players') => {
    if (!activeMatch) return;
    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];
    const rearrangedPlayers = currentPlayers.length > 0
      ? applyFormationToPlayers(currentPlayers, formationKey)
      : [];

    const updatedMatch = {
      ...activeMatch,
      tactics: {
        ...activeMatch.tactics,
        [tacticKey]: {
          ...activeMatch.tactics[tacticKey],
          formation: formationKey,
          [subKey]: rearrangedPlayers,
        },
      },
    };
    handleUpdateMatch(updatedMatch);
    showToast(`Esquema ${formationKey} seleccionado`, 'success');
  };

  // Clear all players from pitch in current tactic phase
  const handleClearPitch = (tacticKey, subKey = 'players') => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar Pizarra',
      message: '¿Querés quitar a todos los jugadores de la pizarra en esta fase?',
      confirmText: 'Limpiar',
      cancelText: 'Cancelar',
      type: 'warning',
      onConfirm: () => {
        let updatedTactics = { ...activeMatch.tactics };
        if (tacticKey === 'ataque' || tacticKey === 'defensa') {
          // Clear starters from BOTH ataque and defensa (and set pieces)
          Object.keys(updatedTactics).forEach(key => {
            ['players', 'players_izq', 'players_der'].forEach(sKey => {
              if (updatedTactics[key]?.[sKey]) {
                updatedTactics[key] = {
                  ...updatedTactics[key],
                  [sKey]: [],
                };
              }
            });
          });
        } else {
          updatedTactics[tacticKey] = {
            ...updatedTactics[tacticKey],
            [subKey]: [],
          };
        }
        const updatedMatch = {
          ...activeMatch,
          tactics: updatedTactics,
        };
        handleUpdateMatch(updatedMatch);
        closeConfirmModal();
        showToast('Pizarra limpiada', 'info');
      },
    });
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

  const handlePrintConfirm = async (sections, action = 'print') => {
    setPrintSections(sections);
    setShowPrintModal(false);
    if (action === 'pdf') {
      showToast('Generando PDF de alta definición…', 'info');
      const res = await generateTacticalPdf(activeMatch);
      if (res && res.success) {
        showToast('PDF generado correctamente 📄', 'success');
      } else if (res && res.error) {
        showToast(res.error, 'error');
      }
    } else {
      setTimeout(() => {
        window.print();
      }, 80);
    }
  };

  // Auto-place player on pitch into the next free tactical formation position
  const handleAutoPlacePlayer = (playerId, tacticKey = activeTactic, subKey = 'players') => {
    const playerObj = state.squad.find(p => p.id === playerId);
    if (!playerObj || !activeMatch) return;

    const currentPlayers = activeMatch.tactics[tacticKey]?.[subKey] || [];
    if (currentPlayers.some(p => p.id === playerId)) return;

    if (currentPlayers.length >= 11 && (tacticKey === 'ataque' || tacticKey === 'defensa')) {
      showToast('Titulares completos (11 en cancha). Arrastrá sobre un jugador para reemplazarlo.', 'warning');
      return;
    }

    const currentFormationKey = activeMatch.tactics[tacticKey]?.formation || '4-3-3';
    const formation = FORMATIONS.find(f => f.key === currentFormationKey) || FORMATIONS[0];

    // Find the first position in selected formation that is free
    let freePos = null;
    for (let i = 0; i < formation.positions.length; i++) {
      const candidate = formation.positions[i];
      const isOccupied = currentPlayers.some(p => Math.hypot(p.x - candidate.x, p.y - candidate.y) < 5);
      if (!isOccupied) {
        freePos = candidate;
        break;
      }
    }

    if (!freePos) {
      freePos = formation.positions[currentPlayers.length] || { x: 50, y: 50 };
    }

    const newPlacedPlayer = { ...playerObj, x: freePos.x, y: freePos.y };

    let updatedTactics = { ...activeMatch.tactics };
    updatedTactics[tacticKey] = {
      ...updatedTactics[tacticKey],
      [subKey]: [...currentPlayers, newPlacedPlayer],
    };

    // SYNC ATAQUE <-> DEFENSA
    if (tacticKey === 'ataque' || tacticKey === 'defensa') {
      const otherKey = tacticKey === 'ataque' ? 'defensa' : 'ataque';
      let otherPlayers = updatedTactics[otherKey]?.players || [];

      if (!otherPlayers.some(p => p.id === playerId) && otherPlayers.length < 11) {
        const otherFormationKey = updatedTactics[otherKey]?.formation || '4-3-3';
        const otherFormation = FORMATIONS.find(f => f.key === otherFormationKey) || FORMATIONS[0];
        let otherFreePos = null;
        for (let i = 0; i < otherFormation.positions.length; i++) {
          const candidate = otherFormation.positions[i];
          const isOccupied = otherPlayers.some(p => Math.hypot(p.x - candidate.x, p.y - candidate.y) < 5);
          if (!isOccupied) {
            otherFreePos = candidate;
            break;
          }
        }
        if (!otherFreePos) {
          otherFreePos = otherFormation.positions[otherPlayers.length] || { x: 50, y: 50 };
        }
        otherPlayers = [...otherPlayers, { ...playerObj, x: otherFreePos.x, y: otherFreePos.y }];
      }

      updatedTactics[otherKey] = {
        ...updatedTactics[otherKey],
        players: otherPlayers,
      };
    }

    const updatedMatch = { ...activeMatch, tactics: updatedTactics };
    handleUpdateMatch(updatedMatch);
    showToast(`${playerObj.name} ubicado en cancha (${currentPlayers.length + 1}/11)`, 'success');
  };

  const fieldPlayerIds = new Set(
    (activeMatch?.tactics?.[activeTactic]?.players || []).map(p => p.id)
  );

  const displaySquad = state.squad;

  return (
    <div className="app-layout">
      {/* ── Football Manager Style 2-Tier Header (Screen Only) ── */}
      <header className="fm-header-wrapper no-print">
        {/* Tier 1: Fechas, Torneo & Global Actions (Line 1) */}
        <div className="fm-tier-1">
          <div className="fm-brand">
            <span className="fm-brand-icon">⚽</span>
            <span className="fm-brand-title">PLANIFICADOR TÁCTICO</span>
          </div>

          <div className="fm-divider" />

          {/* Football Manager Pro Match Selector Dropdown (Line 1) */}
          <div className="fm-match-selector-wrapper" ref={matchDropdownRef}>
            {/* Prev Match Button */}
            <button
              className="fm-match-nav-arrow"
              onClick={goToPrevMatch}
              disabled={!hasPrevMatch}
              title={hasPrevMatch ? `Ir a ${state.matches[activeMatchIndex - 1]?.label || 'Fecha anterior'}` : 'Primera fecha'}
            >
              ‹
            </button>

            {/* Active Match Dropdown Trigger Button */}
            <button
              className={`fm-match-selector-btn${isMatchDropdownOpen ? ' is-active' : ''}`}
              onClick={() => setIsMatchDropdownOpen(prev => !prev)}
              title="Abrir selector de fechas"
            >
              <span className="fm-match-selector-icon">📅</span>
              <span className="fm-match-selector-label">
                {activeMatch?.label || 'Fecha'}
                {activeMatch?.rival ? `: vs. ${activeMatch.rival}` : ''}
              </span>
              <span className="fm-match-selector-count">({activeMatchIndex + 1}/{state.matches.length})</span>
              <span className={`fm-match-selector-arrow${isMatchDropdownOpen ? ' is-open' : ''}`}>▾</span>
            </button>

            {/* Next Match Button */}
            <button
              className="fm-match-nav-arrow"
              onClick={goToNextMatch}
              disabled={!hasNextMatch}
              title={hasNextMatch ? `Ir a ${state.matches[activeMatchIndex + 1]?.label || 'Fecha siguiente'}` : 'Última fecha'}
            >
              ›
            </button>

            {/* New Match Button */}
            <button
              className="fm-new-match-btn"
              onClick={() => {
                setIsMatchDropdownOpen(false);
                handleOpenNewMatchModal();
              }}
              title="Agregar nueva fecha con convocatoria"
            >
              + Nueva Fecha
            </button>

            {/* Floating Dropdown Panel */}
            {isMatchDropdownOpen && (
              <div className="fm-match-dropdown-panel">
                <div className="fm-dropdown-header">
                  <span className="fm-dropdown-title">🏆 FECHAS DEL TORNEO</span>
                  <span className="fm-dropdown-badge">{state.matches.length} fechas</span>
                </div>

                {state.matches.length > 4 && (
                  <div className="fm-dropdown-search-wrapper">
                    <input
                      className="fm-dropdown-search"
                      type="text"
                      placeholder="Buscar fecha o rival…"
                      value={matchSearchQuery}
                      onChange={e => setMatchSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                <div className="fm-dropdown-list">
                  {filteredMatches.map(m => {
                    const isActive = m.id === state.activeMatchId;
                    return (
                      <div
                        key={m.id}
                        className={`fm-dropdown-item${isActive ? ' is-active' : ''}`}
                        onClick={() => {
                          handleSelectMatch(m.id);
                          setIsMatchDropdownOpen(false);
                        }}
                      >
                        <div className="fm-dropdown-item-info">
                          <div className="fm-dropdown-item-title">
                            {isActive && <span className="fm-active-dot" />}
                            <span className="fm-dropdown-item-label">{m.label || 'Fecha'}</span>
                            {m.rival && <span className="fm-dropdown-item-rival">vs. {m.rival}</span>}
                          </div>
                          {(m.date || m.venue) && (
                            <div className="fm-dropdown-item-meta">
                              {fmtDate(m.date) && <span>📅 {fmtDate(m.date)}</span>}
                              {m.venue && <span>📍 {m.venue}</span>}
                            </div>
                          )}
                        </div>

                        {state.matches.length > 1 && (
                          <button
                            className="fm-dropdown-item-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMatch(m.id);
                            }}
                            title="Eliminar esta fecha"
                          >
                            <IconTrash size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {filteredMatches.length === 0 && (
                    <div className="fm-dropdown-empty">No se encontraron fechas</div>
                  )}
                </div>

                <div className="fm-dropdown-footer">
                  <button
                    className="fm-dropdown-add-btn"
                    onClick={() => {
                      setIsMatchDropdownOpen(false);
                      handleOpenNewMatchModal();
                    }}
                  >
                    + Agregar Nueva Fecha
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="fm-spacer" />

          {/* Action buttons on Line 1 */}
          <div className="fm-tier1-actions">
            <button
              className="fm-btn-pdf"
              onClick={handlePrint}
              title="Imprimir / Exportar a PDF"
            >
              <IconPdf size={14} />
              <span>PDF / Imprimir</span>
            </button>

            <button
              className="fm-btn-icon"
              onClick={handleExport}
              title="Exportar backup JSON"
            >
              <span>Exportar BD</span>
            </button>

            <button
              className="fm-btn-icon"
              onClick={() => importRef.current?.click()}
              title="Cargar backup JSON"
            >
              <span>Importar BD</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Funciones Principales & Fases Tácticas (Line 2) */}
        <div className="fm-tier-2">
          {/* Tactical Phase Navigation Tabs */}
          <div className="fm-tactic-tabs">
            {PRINT_SECTIONS.map(t => (
              <button
                key={t.key}
                className={`fm-tactic-tab${activeTactic === t.key ? ' active' : ''}`}
                onClick={() => setActiveTactic(t.key)}
              >
                <span className="fm-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Opponent & Match Delete Action on Line 2 */}
          {activeMatch && (
            <div className="fm-match-info-pill">
              <span className="fm-info-vs">VS.</span>
              <input
                className="fm-rival-input"
                type="text"
                placeholder="RIVAL…"
                value={activeMatch.rival || ''}
                onChange={e => handleUpdateMatch({ ...activeMatch, rival: e.target.value })}
              />
              {state.matches.length > 1 && (
                <button
                  className="fm-btn-delete-match no-print"
                  onClick={() => handleDeleteMatch(activeMatch.id)}
                  title="Eliminar esta fecha"
                >
                  <IconTrash size={13} />
                  <span className="fm-delete-text">Eliminar fecha</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>



      <input
        ref={importRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

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
          calledUpIds={activeMatch?.calledUpIds || []}
          captainId={activeMatch?.captainId}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayerFromSquad}
          onOpenCallUpModal={() => setShowCallUpModal('edit')}
          onToggleCallUp={handleToggleCallUpForActiveMatch}
          onSetCaptain={handleSetCaptain}
          onAutoPlacePlayer={handleAutoPlacePlayer}
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
              onApplyFormation={handleApplyFormation}
              onClearPitch={handleClearPitch}
              onAutoPlacePlayer={handleAutoPlacePlayer}
              onToggleCallUp={handleToggleCallUpForActiveMatch}
              onDeleteMatch={() => handleDeleteMatch(activeMatch.id)}
              canDeleteMatch={state.matches.length > 1}
              printSections={printSections}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayerForPlacement={setSelectedPlayerId}
              onClearSelectedPlayer={() => setSelectedPlayerId(null)}
              onOpenCallUpModal={() => setShowCallUpModal('edit')}
              captainId={activeMatch?.captainId}
            />
          </main>
        )}
      </div>

      {/* Toast Notification Container */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Print Section Selection Modal */}
      {showPrintModal && (
        <PrintSectionsModal
          onConfirm={handlePrintConfirm}
          onCancel={() => setShowPrintModal(false)}
        />
      )}

      {/* Call-up / Convocatoria Modal */}
      {showCallUpModal && (
        <CallUpModal
          squad={state.squad}
          initialCalledUpIds={showCallUpModal === 'new' ? state.squad.map(p => p.id) : (activeMatch?.calledUpIds || [])}
          matchLabel={showCallUpModal === 'new' ? `Fecha ${state.matches.length + 1}` : activeMatch?.label}
          isNewMatch={showCallUpModal === 'new'}
          onSave={showCallUpModal === 'new' ? handleConfirmNewMatch : handleSaveCallUpForActiveMatch}
          onCancel={() => setShowCallUpModal(null)}
        />
      )}
    </div>
  );
}

