import React, { useState } from 'react';
import Pitch from './Pitch.jsx';

const TACTIC_TABS = [
  { key: 'ataque',  label: 'Ataque',         icon: '⚔️' },
  { key: 'defensa', label: 'Defensa',         icon: '🛡️' },
  { key: 'extra',   label: 'Pelota Parada',   icon: '🎯' },
];

const SETPIECES_TABS = [
  { key: 'tirosLibres', label: 'Tiros Libres' },
  { key: 'corners',     label: 'Corners' },
];

const SETPIECES_ROWS = [
  { key: 'ejecutan', label: 'Ejecutan' },
  { key: 'cabecean', label: 'Cabecean' },
  { key: 'defensa',  label: 'Defensa' },
  { key: 'balance',  label: 'Balance' },
];

/** Formats YYYY-MM-DD → DD/MM/YYYY */
function fmtDate(d) {
  return d ? d.split('-').reverse().join('/') : '';
}

/** Header bar present at the top of every printed page & screen canvas */
function MatchHeader({ match, onMatchChange, tacticLabel, onDeleteMatch, canDeleteMatch }) {
  const handleChange = (field, value) => onMatchChange({ ...match, [field]: value });

  return (
    <div className="match-header">
      {/* Left Column: Editable Match Label, Opponent & Tactic Badge */}
      <div className="match-header-left">
        <input
          className="match-header-title-input"
          type="text"
          placeholder="FECHA 1…"
          value={match.label || ''}
          onChange={e => handleChange('label', e.target.value)}
        />

        <div className="match-header-rival-row">
          <span className="match-header-vs">VS.</span>
          <input
            className="match-header-rival-input"
            type="text"
            placeholder="NOMBRE DEL RIVAL…"
            value={match.rival || ''}
            onChange={e => handleChange('rival', e.target.value)}
          />
        </div>

        <div className="match-header-badge-row">
          {tacticLabel && (
            <span className="tactic-pill-badge">
              {tacticLabel}
            </span>
          )}
          {fmtDate(match.date) && (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              • {fmtDate(match.date)}
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Key Match Details & Delete Action */}
      <div className="match-header-right">
        <div className="match-header-fields">
          <div className="match-header-field">
            <span className="match-header-label">📅 Fecha</span>
            <input
              className="match-header-input"
              type="date"
              value={match.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>
          <div className="match-header-field">
            <span className="match-header-label">⏰ Citación</span>
            <input
              className="match-header-input"
              type="time"
              value={match.time}
              onChange={e => handleChange('time', e.target.value)}
            />
          </div>
          <div className="match-header-field">
            <span className="match-header-label">📍 Lugar</span>
            <input
              className="match-header-input"
              type="text"
              placeholder="Cancha / Estadio…"
              value={match.venue}
              onChange={e => handleChange('venue', e.target.value)}
            />
          </div>
        </div>

        {canDeleteMatch && onDeleteMatch && (
          <button
            className="btn-delete-match no-print"
            onClick={() => onDeleteMatch(match.id)}
            title="Eliminar esta fecha"
          >
            🗑️ Eliminar esta fecha
          </button>
        )}
      </div>
    </div>
  );
}

/** Single printable sheet component */
function PrintPage({
  match,
  squad,
  tacticKey,
  tacticLabel,
  isExtra,
  onMatchChange,
  onDrop,
  onPlayerMove,
  onPlayerRemove,
  onDeleteMatch,
  canDeleteMatch,
  isLast,
  selectedPlayerId = null,
  onSelectPlayerForPlacement = null,
  onClearSelectedPlayer = null,
}) {
  const [activeSetpieces, setActiveSetpieces] = useState('tirosLibres');

  const currentFieldIds = new Set(
    (match.tactics[tacticKey]?.players || []).map(p => p.id)
  );
  const availableSquad = squad.filter(p => !currentFieldIds.has(p.id));

  const handleSetpieceChange = (category, field, value) => {
    onMatchChange({
      ...match,
      setpieces: {
        ...match.setpieces,
        [category]: { ...match.setpieces[category], [field]: value }
      },
    });
  };

  const handleSquadItemClick = (playerId) => {
    if (!onSelectPlayerForPlacement) return;
    if (selectedPlayerId === playerId) {
      onSelectPlayerForPlacement(null);
    } else {
      onSelectPlayerForPlacement(playerId);
    }
  };

  return (
    <div className={`printable-board print-page${isLast ? ' last-page' : ''}`}>
      {/* Header (Repeated per page) */}
      <MatchHeader
        match={match}
        onMatchChange={onMatchChange}
        tacticLabel={tacticLabel}
        onDeleteMatch={onDeleteMatch}
        canDeleteMatch={canDeleteMatch}
      />

      {/* Sheet Body */}
      <div className="tactic-body">
        {/* Interactive / Printable Pitch */}
        <Pitch
          tacticKey={tacticKey}
          players={match.tactics[tacticKey]?.players || []}
          onDrop={onDrop}
          onPlayerMove={onPlayerMove}
          onPlayerRemove={onPlayerRemove}
          half={isExtra}
          selectedPlayerId={selectedPlayerId}
          onClearSelectedPlayer={onClearSelectedPlayer}
        />

        {/* Available Squad List (Screen view only) */}
        <div className="onboard-squad no-print">
          <div className="onboard-squad-title">
            <span>Plantel Disponible</span>
            <span style={{ fontSize: 10.5, background: '#326295', color: '#ffffff', padding: '1px 7px', borderRadius: 10, fontWeight: 800 }}>{availableSquad.length}</span>
          </div>
          <div className="onboard-squad-list">
            {availableSquad.map(p => {
              const isSelected = selectedPlayerId === p.id;
              return (
                <div
                  key={p.id}
                  className={`onboard-squad-item${isSelected ? ' is-selected' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('playerId', p.id);
                    e.dataTransfer.setData('playerName', p.name);
                  }}
                  onClick={() => handleSquadItemClick(p.id)}
                  title={isSelected ? 'Seleccionado: tocá la cancha para ubicarlo' : 'Arrastrá o tocá para ubicar en cancha'}
                >
                  <span className="onboard-squad-num">{p.number || '•'}</span>
                  <span className="onboard-squad-name">{p.name}</span>
                  {isSelected && <span className="onboard-squad-check">✓</span>}
                </div>
              );
            })}
            {availableSquad.length === 0 && (
              <div className="onboard-squad-empty">
                Todos ubicados en cancha
              </div>
            )}
          </div>
        </div>

        {/* Set Pieces & Observations Section (Rendered on ALL tactic pages: Ataque, Defensa & Pelota Parada) */}
        <div className="tactic-forms-column">
          {/* SET PIECES */}
          <div className="setpieces-block">
            <div className="setpieces-header">
              <div className="setpieces-title">Pelota Parada</div>
              <div className="setpieces-tabs no-print">
                {SETPIECES_TABS.map(t => (
                  <div
                    key={t.key}
                    className={`setpieces-tab${activeSetpieces === t.key ? ' active' : ''}`}
                    onClick={() => setActiveSetpieces(t.key)}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Screen: Tabbed view */}
            <div className="no-print">
              <SetpiecesCategory
                label={SETPIECES_TABS.find(t => t.key === activeSetpieces)?.label}
                data={match.setpieces[activeSetpieces]}
                onChange={(f, v) => handleSetpieceChange(activeSetpieces, f, v)}
              />
            </div>

            {/* Print: Both categories side-by-side */}
            <div className="setpieces-print-row print-only">
              {SETPIECES_TABS.map(t => (
                <div key={t.key} style={{ flex: 1 }}>
                  <SetpiecesCategory
                    label={t.label}
                    data={match.setpieces[t.key]}
                    onChange={(f, v) => handleSetpieceChange(t.key, f, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* OBSERVATIONS */}
          <div className="observations-block">
            <div className="observations-title">Observaciones / Indicaciones</div>
            <textarea
              className="observations-content"
              value={match.observations || ''}
              onChange={e => onMatchChange({ ...match, observations: e.target.value })}
              placeholder="Escribí notas tácticas, marcas específicas, cambios programados…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SetpiecesCategory({ label, data, onChange }) {
  return (
    <div>
      {label && (
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748b',
          marginBottom: '1.5mm'
        }}>
          {label}
        </div>
      )}
      <div className="setpieces-grid">
        {SETPIECES_ROWS.map(row => (
          <div key={row.key} className="setpieces-row-cell">
            <div className="setpieces-cell-label">{row.label}</div>
            <textarea
              className="setpieces-cell-names"
              value={data?.[row.key] || ''}
              onChange={e => onChange(row.key, e.target.value)}
              placeholder="Jugadores…"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrintableBoard({
  match,
  squad,
  activeTactic = 'ataque',
  onTacticChange,
  onMatchChange,
  onDrop,
  onPlayerMove,
  onPlayerRemove,
  onDeleteMatch,
  canDeleteMatch,
  printSections,
  selectedPlayerId = null,
  onSelectPlayerForPlacement = null,
  onClearSelectedPlayer = null,
}) {
  const [internalTactic, setInternalTactic] = useState('ataque');
  const currentTactic = onTacticChange ? activeTactic : internalTactic;
  const setTactic = onTacticChange || setInternalTactic;
  const activeTab = TACTIC_TABS.find(t => t.key === currentTactic);
  // Filter for print — default to all if not provided
  const sectionsToprint = printSections || { ataque: true, defensa: true, extra: true };
  const printTabs = TACTIC_TABS.filter(t => sectionsToprint[t.key]);

  return (
    <>
      {/* ── SCREEN: Tactic Tab Selector ── */}
      <div className="tactic-tabs-bar no-print">
        <div className="tactic-tabs-container">
          {TACTIC_TABS.map(t => (
            <button
              key={t.key}
              className={`tactic-tab-btn${currentTactic === t.key ? ' active' : ''}`}
              onClick={() => setTactic(t.key)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SCREEN VIEW: Current active sheet ── */}
      <div className="board-scroll no-print">
        <PrintPage
          match={match}
          squad={squad}
          tacticKey={currentTactic}
          tacticLabel={activeTab?.label}
          isExtra={currentTactic === 'extra'}
          onMatchChange={onMatchChange}
          onDrop={onDrop}
          onPlayerMove={onPlayerMove}
          onPlayerRemove={onPlayerRemove}
          onDeleteMatch={onDeleteMatch}
          canDeleteMatch={canDeleteMatch}
          isLast={false}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayerForPlacement={onSelectPlayerForPlacement}
          onClearSelectedPlayer={onClearSelectedPlayer}
        />
      </div>

      {/* ── PRINT VIEW: Filtered tactic pages ── */}
      <div className="print-pages-container" style={{ display: 'none' }}>
        {printTabs.map((t, i) => (
          <PrintPage
            key={t.key}
            match={match}
            squad={squad}
            tacticKey={t.key}
            tacticLabel={t.label}
            isExtra={t.key === 'extra'}
            onMatchChange={onMatchChange}
            onDrop={onDrop}
            onPlayerMove={onPlayerMove}
            onPlayerRemove={onPlayerRemove}
            onDeleteMatch={onDeleteMatch}
            canDeleteMatch={canDeleteMatch}
            isLast={i === printTabs.length - 1}
          />
        ))}
      </div>
    </>
  );
}
