import React, { useState } from 'react';
import Pitch from './Pitch.jsx';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconSword,
  IconShield,
  IconTarget,
  IconFlag,
  IconUserMinus,
} from './Icons.jsx';

const TACTIC_TABS = [
  { key: 'ataque', label: 'Ataque', icon: <IconSword size={16} /> },
  { key: 'defensa', label: 'Defensa', icon: <IconShield size={16} /> },
  { key: 'tiros_libres', label: 'Tiros Libres', icon: <IconTarget size={16} /> },
  { key: 'corners', label: 'Corners', icon: <IconFlag size={16} /> },
];

const SETPIECES_ROWS = [
  { key: 'ejecutan', label: 'Ejecutan' },
  { key: 'cabecean', label: 'Cabecean' },
  { key: 'defensa', label: 'Defensa' },
  { key: 'balance', label: 'Balance' },
];

/** Header bar present at the top of every printed page & screen canvas */
function MatchHeader({ match, onMatchChange }) {
  const handleChange = (field, value) => onMatchChange({ ...match, [field]: value });

  return (
    <div className="match-header">
      {/* Left Column: Editable Match Label & Opponent */}
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
      </div>

      {/* Right Column: Key Match Details */}
      <div className="match-header-right">
        <div className="match-header-fields">
          <div className="match-header-field">
            <span className="match-header-label">
              <IconCalendar size={13} /> Fecha
            </span>
            <input
              className="match-header-input"
              type="date"
              value={match.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>
          <div className="match-header-field">
            <span className="match-header-label">
              <IconClock size={13} /> Citación
            </span>
            <input
              className="match-header-input"
              type="time"
              value={match.time}
              onChange={e => handleChange('time', e.target.value)}
            />
          </div>
          <div className="match-header-field">
            <span className="match-header-label">
              <IconMapPin size={13} /> Lugar
            </span>
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
    </div>
  );
}

function TacticBody({
  match,
  squad,
  tacticKey,
  subKey = 'players',
  tacticLabel,
  isExtra,
  onMatchChange,
  onDrop,
  onPlayerMove,
  onPlayerRemove,
  onApplyFormation,
  onClearPitch,
  onAutoPlacePlayer,
  onToggleCallUp,
  selectedPlayerId,
  _onSelectPlayerForPlacement,
  onClearSelectedPlayer,
  captainId,
}) {
  const calledUpIdsSet = new Set(match.calledUpIds || squad.map(p => p.id));
  const mainStartersList = match.tactics.ataque?.players || match.tactics.defensa?.players || [];
  const mainStartersSet = new Set(mainStartersList.map(p => p.id));

  // In set pieces (tiros libres & corners), ONLY 11 titulares from Ataque/Defensa are eligible
  const calledUpSquad = isExtra
    ? squad.filter(p => mainStartersSet.has(p.id))
    : squad.filter(p => calledUpIdsSet.has(p.id));

  const currentFieldPlayers = match.tactics[tacticKey]?.[subKey]
    || (subKey === 'players_ataque' ? (match.tactics[tacticKey]?.players_izq || match.tactics[tacticKey]?.players || []) : [])
    || (subKey === 'players_defensa' ? (match.tactics[tacticKey]?.players_der || []) : []);
  const currentFieldIds = new Set(currentFieldPlayers.map(p => p.id));

  const availableSquad = calledUpSquad.filter(p => !currentFieldIds.has(p.id));

  const isFullField = tacticKey === 'ataque' || tacticKey === 'defensa';
  const startersCount = currentFieldPlayers.length;
  const is11Complete = isFullField && startersCount >= 11;

  const currentFormationKey = match.tactics[tacticKey]?.formation || '4-3-3';

  const subTag = subKey !== 'players' ? subKey.replace('players_', '') : 'players';
  const setpieceDataKey = subKey !== 'players' ? `${tacticKey}_${subTag}` : tacticKey;
  const oldSetpieceKey = subTag === 'ataque' ? `${tacticKey}_izq` : (subTag === 'defensa' ? `${tacticKey}_der` : tacticKey);
  const setpieceData = match.setpieces?.[setpieceDataKey] || match.setpieces?.[oldSetpieceKey] || match.setpieces?.[tacticKey] || {};

  const obsKey = subKey !== 'players' ? `observations_${subTag}` : 'observations';
  const oldObsKey = subTag === 'ataque' ? 'observations_izq' : (subTag === 'defensa' ? 'observations_der' : 'observations');
  const obsValue = match.tactics[tacticKey]?.[obsKey] !== undefined
    ? match.tactics[tacticKey]?.[obsKey]
    : (match.tactics[tacticKey]?.[oldObsKey] !== undefined
        ? match.tactics[tacticKey]?.[oldObsKey]
        : (match.tactics[tacticKey]?.observations || ''));

  const handleSetpieceChange = (category, field, value) => {
    onMatchChange({
      ...match,
      setpieces: {
        ...match.setpieces,
        [category]: { ...match.setpieces?.[category], [field]: value }
      },
    });
  };

  const handleSquadItemClick = (playerId) => {
    if (is11Complete && isFullField) return;
    if (onAutoPlacePlayer) {
      onAutoPlacePlayer(playerId, tacticKey, subKey);
    }
  };

  return (
    <div className={`tactic-body${isExtra ? ' is-setpiece-body' : ''}`}>
      {/* Column 1: Tactical Pitch */}
      <Pitch
        tacticKey={tacticKey}
        players={currentFieldPlayers}
        onDrop={onDrop}
        onPlayerMove={onPlayerMove}
        onPlayerRemove={onPlayerRemove}
        onApplyFormation={onApplyFormation}
        onClearPitch={onClearPitch}
        subKey={subKey}
        half={isExtra}
        selectedPlayerId={selectedPlayerId}
        onClearSelectedPlayer={onClearSelectedPlayer}
        captainId={captainId}
        formationKey={currentFormationKey}
      />

      {/* Column 2: Plantel Convocado / Banco de Suplentes List (Screen view only) */}
      <div className="onboard-squad no-print">
        <div className="onboard-squad-title">
          <span>{isExtra ? 'Titulares Disponibles' : (is11Complete ? 'Banco de Suplentes' : 'Plantel Convocado')}</span>
          <span className={`onboard-squad-badge${is11Complete ? ' is-suplentes' : ''}`}>
            {isExtra
              ? `${currentFieldPlayers.length}/${mainStartersSet.size || 11}`
              : (is11Complete ? `${availableSquad.length} suplentes` : `Titulares: ${startersCount}/11`)}
          </span>
        </div>

        <div className="onboard-squad-list">
          {availableSquad.map(p => {
            const isCaptain = p.id === captainId;
            return (
              <div
                key={p.id}
                className={`onboard-squad-item${is11Complete ? ' is-suplente-item' : ''}`}
                draggable={!is11Complete}
                onDragStart={(e) => {
                  if (is11Complete && !isExtra) return;
                  e.dataTransfer.effectAllowed = 'copy';
                  e.dataTransfer.setData('playerId', p.id);
                  e.dataTransfer.setData('playerName', p.name);
                }}
                onClick={() => handleSquadItemClick(p.id)}
                title={
                  is11Complete && !isExtra
                    ? 'Suplente: quitá un jugador de la cancha para ubicarlo'
                    : 'Tocar para ubicar en cancha'
                }
              >
                <span className="onboard-squad-num">{p.number || '•'}</span>
                <span className="onboard-squad-name">
                  {p.name}
                  {isCaptain && <span className="captain-tag"> (C)</span>}
                </span>
                {onToggleCallUp && (
                  <button
                    className="btn-uncallup-icon no-print"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCallUp(p.id);
                    }}
                    title="Quitar de la citación para este partido"
                  >
                    <IconUserMinus size={13} />
                  </button>
                )}
              </div>
            );
          })}
          {availableSquad.length === 0 && (
            <div className="onboard-squad-empty">
              {isExtra
                ? (mainStartersSet.size === 0
                    ? 'Ubicá los 11 titulares en Ataque'
                    : 'Todos los titulares ubicados')
                : (is11Complete ? 'Sin suplentes convocados' : 'Todos ubicados')}
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Set Pieces, Observaciones (Tall & Prominent) & Printed Suplentes Block */}
      <div className="tactic-forms-column">
        {/* SET PIECES (Only rendered if it's a set piece page) */}
        {isExtra && (
          <div className="setpieces-block">
            <div className="setpieces-header">
              <div className="setpieces-title">{tacticLabel}</div>
            </div>
            <SetpiecesCategory
              data={setpieceData}
              onChange={(f, v) => handleSetpieceChange(setpieceDataKey, f, v)}
            />
          </div>
        )}

        {/* OBSERVATIONS (ALWAYS VISIBLE & PROMINENT) */}
        <div className={`observations-block${!isExtra ? ' is-expanded' : ''}`}>
          <div className="observations-title">Observaciones / Indicaciones</div>
          <textarea
            className="observations-content"
            value={obsValue}
            onChange={e => {
              const val = e.target.value;
              onMatchChange({
                ...match,
                tactics: {
                  ...match.tactics,
                  [tacticKey]: {
                    ...match.tactics[tacticKey],
                    [obsKey]: val,
                  },
                },
              });
            }}
            placeholder="Escribí notas tácticas, marcas específicas, cambios programados…"
          />
        </div>

        {/* SUPLENTES / CONVOCADOS PRINTED BLOCK (Full pitch tactics only) */}
        {!isExtra && (
          <div className="suplentes-block">
            <div className="suplentes-title">
              <span>📋 SUPLENTES / CONVOCADOS</span>
              <span className="suplentes-badge-pill">{availableSquad.length} suplentes</span>
            </div>
            <div className="suplentes-list-inline">
              {availableSquad.map(p => (
                <span key={p.id} className="suplente-chip">
                  <span className="suplente-chip-num">{p.number ? `Nº ${p.number}` : '•'}</span>
                  <span className="suplente-chip-name">
                    {p.name}
                    {p.id === captainId && <span className="captain-tag"> (C)</span>}
                  </span>
                </span>
              ))}
              {availableSquad.length === 0 && (
                <span className="suplentes-empty-text">Sin suplentes / Todos en cancha</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrintPage({
  match,
  squad,
  tacticKey,
  singleSubKey = null,
  tacticLabel,
  isExtra,
  onMatchChange,
  onDrop,
  onPlayerMove,
  onPlayerRemove,
  onApplyFormation,
  onClearPitch,
  onAutoPlacePlayer,
  onToggleCallUp = null,
  isLast,
  selectedPlayerId = null,
  onSelectPlayerForPlacement = null,
  onClearSelectedPlayer = null,
  captainId = null,
}) {
  return (
    <div className={`printable-board print-page${isLast ? ' last-page' : ''}`}>
      {/* Header (Repeated per page) */}
      <MatchHeader
        match={match}
        onMatchChange={onMatchChange}
      />

      {isExtra ? (
        <div className="setpieces-stacked-container">
          <TacticBody
            match={match}
            squad={squad}
            tacticKey={tacticKey}
            subKey="players_ataque"
            tacticLabel={`${tacticLabel} (ATAQUE)`}
            isExtra={true}
            onMatchChange={onMatchChange}
            onDrop={onDrop}
            onPlayerMove={onPlayerMove}
            onPlayerRemove={onPlayerRemove}
            onApplyFormation={onApplyFormation}
            onClearPitch={onClearPitch}
            onAutoPlacePlayer={onAutoPlacePlayer}
            onToggleCallUp={onToggleCallUp}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayerForPlacement={onSelectPlayerForPlacement}
            onClearSelectedPlayer={onClearSelectedPlayer}
            captainId={captainId}
          />
          <div className="setpieces-dotted-divider" />
          <TacticBody
            match={match}
            squad={squad}
            tacticKey={tacticKey}
            subKey="players_defensa"
            tacticLabel={`${tacticLabel} (DEFENSA)`}
            isExtra={true}
            onMatchChange={onMatchChange}
            onDrop={onDrop}
            onPlayerMove={onPlayerMove}
            onPlayerRemove={onPlayerRemove}
            onApplyFormation={onApplyFormation}
            onClearPitch={onClearPitch}
            onAutoPlacePlayer={onAutoPlacePlayer}
            onToggleCallUp={onToggleCallUp}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayerForPlacement={onSelectPlayerForPlacement}
            onClearSelectedPlayer={onClearSelectedPlayer}
            captainId={captainId}
          />
        </div>
      ) : (
        <TacticBody
          match={match}
          squad={squad}
          tacticKey={tacticKey}
          subKey={singleSubKey || 'players'}
          tacticLabel={tacticLabel}
          isExtra={isExtra}
          onMatchChange={onMatchChange}
          onDrop={onDrop}
          onPlayerMove={onPlayerMove}
          onPlayerRemove={onPlayerRemove}
          onApplyFormation={onApplyFormation}
          onClearPitch={onClearPitch}
          onAutoPlacePlayer={onAutoPlacePlayer}
          onToggleCallUp={onToggleCallUp}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayerForPlacement={onSelectPlayerForPlacement}
          onClearSelectedPlayer={onClearSelectedPlayer}
          captainId={captainId}
        />
      )}
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
              rows={1}
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
  onApplyFormation,
  onClearPitch,
  onAutoPlacePlayer = null,
  onToggleCallUp = null,
  onDeleteMatch,
  canDeleteMatch,
  printSections,
  selectedPlayerId = null,
  onSelectPlayerForPlacement = null,
  onClearSelectedPlayer = null,
  onOpenCallUpModal = null,
  captainId = null,
}) {
  const [internalTactic, setInternalTactic] = useState('ataque');
  const currentTactic = onTacticChange ? activeTactic : internalTactic;
  const setTactic = onTacticChange || setInternalTactic;
  const activeTab = TACTIC_TABS.find(t => t.key === currentTactic);
  const sectionsToprint = printSections || { ataque: true, defensa: true, tiros_libres: true, corners: true };
  const printTabs = TACTIC_TABS.filter(t => sectionsToprint[t.key]);

  return (
    <>
      {/* ── SCREEN: Tactic Tab Selector (Rendered if not provided by header) ── */}
      {!onTacticChange && (
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
      )}

      {/* ── SCREEN VIEW: Current active sheet ── */}
      <div className="board-scroll no-print">
        <PrintPage
          match={match}
          squad={squad}
          tacticKey={currentTactic}
          tacticLabel={activeTab?.label}
          isExtra={currentTactic !== 'ataque' && currentTactic !== 'defensa'}
          onMatchChange={onMatchChange}
          onDrop={onDrop}
          onPlayerMove={onPlayerMove}
          onPlayerRemove={onPlayerRemove}
          onApplyFormation={onApplyFormation}
          onClearPitch={onClearPitch}
          onAutoPlacePlayer={onAutoPlacePlayer}
          onToggleCallUp={onToggleCallUp}
          onDeleteMatch={onDeleteMatch}
          canDeleteMatch={canDeleteMatch}
          isLast={false}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayerForPlacement={onSelectPlayerForPlacement}
          onClearSelectedPlayer={onClearSelectedPlayer}
          onOpenCallUpModal={onOpenCallUpModal}
          captainId={captainId}
        />
      </div>

      {/* ── PRINT VIEW: Filtered tactic pages ── */}
      <div className="print-pages-container" style={{ display: 'none' }}>
        {printTabs.map((t, i) => {
          const isExtra = t.key !== 'ataque' && t.key !== 'defensa';

          return (
            <PrintPage
              key={t.key}
              match={match}
              squad={squad}
              tacticKey={t.key}
              singleSubKey={isExtra ? null : 'players'}
              tacticLabel={t.label}
              isExtra={isExtra}
              onMatchChange={onMatchChange}
              onDrop={onDrop}
              onPlayerMove={onPlayerMove}
              onPlayerRemove={onPlayerRemove}
              onApplyFormation={onApplyFormation}
              onClearPitch={onClearPitch}
              onDeleteMatch={onDeleteMatch}
              canDeleteMatch={canDeleteMatch}
              isLast={i === printTabs.length - 1}
              onOpenCallUpModal={onOpenCallUpModal}
              captainId={captainId}
            />
          );
        })}
      </div>
    </>
  );
}

