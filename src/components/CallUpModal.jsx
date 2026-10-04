import React, { useState } from 'react';

export default function CallUpModal({
  squad,
  initialCalledUpIds = [],
  matchLabel = 'Nuevo Partido',
  isNewMatch = false,
  onSave,
  onCancel,
}) {
  const [selectedIds, setSelectedIds] = useState(() => {
    if (Array.isArray(initialCalledUpIds) && initialCalledUpIds.length > 0) {
      return new Set(initialCalledUpIds);
    }
    // For new matches, default to all squad members selected
    return new Set(squad.map(p => p.id));
  });

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(squad.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    onSave(Array.from(selectedIds));
  };

  return (
    <div className="print-modal-overlay" onClick={onCancel}>
      <div className="callup-modal" onClick={e => e.stopPropagation()}>
        <div className="callup-modal-header">
          <div className="callup-modal-header-icon">📋</div>
          <div>
            <div className="callup-modal-title">
              {isNewMatch ? `Nueva Fecha: Convocatoria` : `Convocatoria — ${matchLabel}`}
            </div>
            <div className="callup-modal-subtitle">
              Seleccioná los jugadores citados para este encuentro
            </div>
          </div>
        </div>

        <div className="callup-modal-toolbar">
          <span className="callup-count-badge">
            {selectedIds.size} de {squad.length} convocados
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>
              Todos
            </button>
            <button className="btn btn-ghost btn-sm" onClick={deselectAll}>
              Ninguno
            </button>
          </div>
        </div>

        <div className="callup-modal-list">
          {squad.map(player => {
            const isChecked = selectedIds.has(player.id);
            return (
              <label key={player.id} className={`callup-player-option${isChecked ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(player.id)}
                />
                <span className="callup-player-num">{player.number || '•'}</span>
                <span className="callup-player-name">{player.name}</span>
                {isChecked && <span className="callup-player-check">✓ Citado</span>}
              </label>
            );
          })}
          {squad.length === 0 && (
            <div className="callup-modal-empty">
              No hay jugadores en la plantilla global. Crealos en el panel lateral.
            </div>
          )}
        </div>

        <div className="callup-modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-print" onClick={handleConfirm}>
            {isNewMatch ? '✓ Crear Fecha con Convocatoria' : '✓ Guardar Convocatoria'}
          </button>
        </div>
      </div>
    </div>
  );
}
