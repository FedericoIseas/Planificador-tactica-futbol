import React, { useState } from 'react';

export default function Sidebar({ squad, fieldPlayerIds, onAddPlayer, onRemovePlayer }) {
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="sidebar-title">📋 Plantilla</span>
          <span className="sidebar-count-badge">{squad.length} jug.</span>
        </div>
        <form className="sidebar-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="sidebar-num-input"
            placeholder="Nº"
            value={newNum}
            onChange={e => setNewNum(e.target.value)}
            maxLength={3}
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
          return (
            <div
              key={player.id}
              className={`player-token${isOnField ? ' on-field' : ''}`}
              draggable={!isOnField}
              onDragStart={(e) => handleDragStart(e, player)}
              title={isOnField ? 'Ya ubicado en este partido' : 'Arrastrá a la cancha'}
            >
              <div className="player-token-jersey">
                {player.number || '•'}
              </div>
              <span className="player-token-name">{player.name}</span>
              <div className="player-token-actions">
                {isOnField ? (
                  <span style={{ fontSize: 11, color: '#60a5fa' }} title="En cancha">📍</span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-3)', cursor: 'grab' }}>⠿</span>
                )}
                <button
                  className="btn btn-danger btn-close"
                  onClick={() => onRemovePlayer(player.id)}
                  title="Eliminar de plantilla"
                >×</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer-hint">
        <span>💡</span>
        <span>Arrastrá un jugador hacia la cancha</span>
      </div>
    </aside>
  );
}
