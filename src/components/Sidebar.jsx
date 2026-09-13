import React, { useState } from 'react';

export default function Sidebar({
  squad,
  fieldPlayerIds,
  onAddPlayer,
  onRemovePlayer,
  isOpen = false,
  onClose,
  selectedPlayerId = null,
  onSelectPlayerForPlacement,
}) {
  const [newName, setNewName] = useState('');
  const [newNum, setNewNum] = useState('');

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

  const handlePlayerClick = (player, isOnField) => {
    if (isOnField) return;
    if (onSelectPlayerForPlacement) {
      if (selectedPlayerId === player.id) {
        onSelectPlayerForPlacement(null);
      } else {
        onSelectPlayerForPlacement(player.id);
        // On small mobile screens, auto-closing the drawer after selecting makes it easy to tap the pitch
        if (window.innerWidth < 768 && onClose) {
          onClose();
        }
      }
    }
  };

  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="sidebar-title">📋 Plantilla</span>
            <span className="sidebar-count-badge">{squad.length} jug.</span>
          </div>
          {onClose && (
            <button
              className="sidebar-close-btn no-print"
              onClick={onClose}
              title="Cerrar panel de plantilla"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
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
      </div>

      <div className="sidebar-list">
        {squad.length === 0 && (
          <div className="sidebar-empty">
            Agregá los jugadores de tu plantel arriba ⬆️ para ubicarlos en el campo de juego.
          </div>
        )}
        {squad.map((player) => {
          const isOnField = fieldPlayerIds.has(player.id);
          const isSelected = selectedPlayerId === player.id;
          return (
            <div
              key={player.id}
              className={`player-token${isOnField ? ' on-field' : ''}${isSelected ? ' is-selected' : ''}`}
              draggable={!isOnField}
              onDragStart={(e) => handleDragStart(e, player)}
              onClick={() => handlePlayerClick(player, isOnField)}
              title={
                isOnField
                  ? 'Ya ubicado en este partido'
                  : isSelected
                    ? 'Seleccionado: tocá la cancha para ubicarlo'
                    : 'Tocá o arrastrá a la cancha'
              }
            >
              <div className="player-token-jersey">
                {player.number || '•'}
              </div>
              <span className="player-token-name">{player.name}</span>
              <div className="player-token-actions">
                {isOnField ? (
                  <span style={{ fontSize: 11, color: '#60a5fa' }} title="En cancha">📍</span>
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
        <span>Arrastrá o tocá un jugador para ubicarlo</span>
      </div>
    </aside>
  );
}
