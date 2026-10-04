import React, { useState } from 'react';

export default function Sidebar({
  squad,
  fieldPlayerIds,
  calledUpIds = [],
  captainId = null,
  onAddPlayer,
  onRemovePlayer,
  onOpenCallUpModal,
  onToggleCallUp,
  onSetCaptain,
  onAutoPlacePlayer,
  isOpen = false,
  onClose,
  selectedPlayerId = null,
  onSelectPlayerForPlacement,
}) {
  const [newName, setNewName] = useState('');
  const [newNum, setNewNum] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const calledUpSet = new Set(calledUpIds);

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) return;
    onAddPlayer(trimmed, newNum.trim() || '');
    setNewName('');
    setNewNum('');
  };

  const handleDragStart = (e, player) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('playerId', player.id);
    e.dataTransfer.setData('playerName', player.name);
  };

  const handlePlayerClick = (player, isOnField, isCalledUp) => {
    if (!isCalledUp) {
      if (onToggleCallUp) {
        onToggleCallUp(player.id);
      }
      return;
    }
    if (isOnField) return;

    if (onAutoPlacePlayer) {
      onAutoPlacePlayer(player.id);
      if (window.innerWidth < 768 && onClose) {
        onClose();
      }
    } else if (onSelectPlayerForPlacement) {
      if (selectedPlayerId === player.id) {
        onSelectPlayerForPlacement(null);
      } else {
        onSelectPlayerForPlacement(player.id);
        if (window.innerWidth < 768 && onClose) {
          onClose();
        }
      }
    }
  };

  const filteredSquad = squad.filter(player => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = player.name.toLowerCase().includes(q);
    const numMatch = String(player.number || '').includes(q);
    return nameMatch || numMatch;
  });

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="sidebar-title">📋 Plantilla</span>
            <span className="sidebar-count-badge">{squad.length} jug.</span>
          </div>
          {onClose && (
            <button className="sidebar-close-btn no-print" onClick={onClose} title="Cerrar menú">
              ✕
            </button>
          )}
        </div>

        {onOpenCallUpModal && (
          <button
            className="sidebar-callup-btn"
            onClick={onOpenCallUpModal}
            title="Abrir gestor de convocatoria de esta fecha"
          >
            <span>📋 Convocatoria:</span>
            <strong>{calledUpSet.size} de {squad.length} citados</strong>
          </button>
        )}

        <form className="sidebar-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="sidebar-num-input"
            placeholder="Nº"
            value={newNum}
            onChange={e => setNewNum(e.target.value)}
            maxLength={3}
            inputMode="numeric"
          />
          <input
            type="text"
            placeholder="Nombre de jugador…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
            maxLength={22}
          />
          <button type="submit" className="btn btn-primary btn-icon" title="Agregar a plantilla">+</button>
        </form>

        {/* Squad Search Filter Input */}
        <div className="sidebar-search-wrapper">
          <span className="sidebar-search-icon">🔍</span>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Buscar por nombre o Nº…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="sidebar-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      <div className="sidebar-list">
        {squad.length === 0 && (
          <div className="sidebar-empty">
            Agregá los jugadores de tu plantel arriba ⬆️ para ubicarlos en el campo de juego.
          </div>
        )}
        {squad.length > 0 && filteredSquad.length === 0 && (
          <div className="sidebar-empty">
            Sin resultados para &quot;{searchQuery}&quot;
          </div>
        )}
        {filteredSquad.map((player) => {
          const isOnField = fieldPlayerIds.has(player.id);
          const isCalledUp = calledUpSet.has(player.id);
          const isSelected = selectedPlayerId === player.id;
          const isCaptain = captainId === player.id;

          return (
            <div
              key={player.id}
              className={`player-token${isOnField ? ' on-field' : ''}${!isCalledUp ? ' not-called-up' : ''}${isSelected ? ' is-selected' : ''}${isCaptain ? ' is-captain-token' : ''}`}
              draggable={!isOnField && isCalledUp}
              onDragStart={(e) => isCalledUp && handleDragStart(e, player)}
              onClick={() => handlePlayerClick(player, isOnField, isCalledUp)}
              title={
                !isCalledUp
                  ? 'Jugador no citado para esta fecha (click para citar)'
                  : isOnField
                    ? 'Ya ubicado en este partido'
                    : isSelected
                      ? 'Seleccionado: tocá la cancha para ubicarlo'
                      : 'Tocá o arrastrá a la cancha'
              }
            >
              <div className="player-token-jersey">
                {player.number || '•'}
                {isCaptain && <span className="captain-badge-jersey">C</span>}
              </div>
              <span className="player-token-name">
                {player.name}
                {isCaptain && <span className="captain-tag"> (C)</span>}
              </span>

              <div className="player-token-actions">
                {onSetCaptain && (
                  <button
                    className={`btn-captain-toggle${isCaptain ? ' active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetCaptain(player.id);
                    }}
                    title={isCaptain ? 'Quitar capitanía' : 'Designar Capitán (C)'}
                  >
                    C
                  </button>
                )}

                {onToggleCallUp && (
                  <button
                    className={`btn-callup-star${isCalledUp ? ' is-active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCallUp(player.id);
                    }}
                    title={isCalledUp ? 'Descitar de este partido' : 'Citar para este partido'}
                  >
                    {isCalledUp ? '★' : '☆'}
                  </button>
                )}

                {isOnField ? (
                  <span style={{ fontSize: 11, color: '#60a5fa' }} title="En cancha">📍</span>
                ) : !isCalledUp ? (
                  <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>No citado</span>
                ) : isSelected ? (
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>✓ Listo</span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-3)', cursor: 'grab' }}>⠿</span>
                )}
                <button
                  className="btn btn-danger btn-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(player.id);
                  }}
                  title="Eliminar de plantilla"
                >×</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer-hint">
        <span>💡</span>
        <span>Tocá [C] para Capitán | ★ para Citar</span>
      </div>
    </aside>
  );
}

