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
function MatchHeader({ match, onMatchChange, tacticLabel }) {
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
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              • {fmtDate(match.date)}
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Key Match Details */}
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
    </div>
  );
}

/** Single printable sheet component */
function PrintPage({ match, squad, tacticKey, tacticLabel, isExtra, onMatchChange, onDrop, onPlayerMove, onPlayerRemove, isLast }) {
  const [activeSetpieces, setActiveSetpieces] = useState('tirosLibres');
  
  const allFieldIds = new Set(
    Object.values(match.tactics).flatMap(t => (t.players || []).map(p => p.id))
  );
  const availableSquad = squad.filter(p => !allFieldIds.has(p.id));

  const handleSetpieceChange = (category, field, value) => {
    onMatchChange({
      ...match,
      setpieces: {
        ...match.setpieces,
        [category]: { ...match.setpieces[category], [field]: value }
      },
    });
  };

  return (
    <div className={`printable-board print-page${isLast ? ' last-page' : ''}`}>
      {/* Header (Repeated per page) */}
      <MatchHeader match={match} onMatchChange={onMatchChange} tacticLabel={tacticLabel} />

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
        />

        {/* Available Squad List (Screen view only) */}
        <div className="onboard-squad no-print">
          <div className="onboard-squad-title">
            <span>Plantel Disponible</span>
            <span style={{ fontSize: 9, color: '#3b82f6' }}>{availableSquad.length}</span>
          </div>
          {availableSquad.map(p => (
            <div key={p.id} className="onboard-squad-item">
              <span className="onboard-squad-num">{p.number || '•'}</span>
              <span>{p.name}</span>
            </div>
          ))}
          {availableSquad.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 8.5, fontStyle: 'italic', paddingTop: 6, textAlign: 'center' }}>
              Todos ubicados en cancha
            </div>
          )}
        </div>

        {/* Set Pieces & Observations Section (Only on 'extra' tactic page) */}
        {isExtra && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3mm' }}>
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
              <div className="print-only" style={{ display: 'none', flexDirection: 'row', gap: '3mm' }}>
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
        )}
      </div>
    </div>
  );
}

function SetpiecesCategory({ label, data, onChange }) {
  return (
    <div>
      {label && (
        <div style={{
          fontSize: 8,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#64748b',
          marginBottom: '1.5mm'
        }}>
          {label}
        </div>
      )}
      <div className="setpieces-grid">
        {SETPIECES_ROWS.map(row => (
          <div key={row.key}>
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

export default function PrintableBoard({ match, squad, onMatchChange, onDrop, onPlayerMove, onPlayerRemove }) {
  const [activeTactic, setActiveTactic] = useState('ataque');
  const activeTab = TACTIC_TABS.find(t => t.key === activeTactic);

  return (
    <>
      {/* ── SCREEN: Tactic Tab Selector ── */}
      <div className="tactic-tabs-bar no-print">
        <div className="tactic-tabs-container">
          {TACTIC_TABS.map(t => (
            <button
              key={t.key}
              className={`tactic-tab-btn${activeTactic === t.key ? ' active' : ''}`}
              onClick={() => setActiveTactic(t.key)}
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
          tacticKey={activeTactic}
          tacticLabel={activeTab?.label}
          isExtra={activeTactic === 'extra'}
          onMatchChange={onMatchChange}
          onDrop={onDrop}
          onPlayerMove={onPlayerMove}
          onPlayerRemove={onPlayerRemove}
          isLast={false}
        />
      </div>

      {/* ── PRINT VIEW: All 3 tactic pages sequence ── */}
      <div className="print-pages-container" style={{ display: 'none' }}>
        {TACTIC_TABS.map((t, i) => (
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
            isLast={i === TACTIC_TABS.length - 1}
          />
        ))}
      </div>
    </>
  );
}
