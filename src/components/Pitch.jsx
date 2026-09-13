import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Pitch — renders an SVG football pitch and acts as an interactive drop zone.
 * Players on the pitch are rendered as tactical pins with jersey numbers.
 */
export default function Pitch({ players, onDrop, onPlayerMove, onPlayerRemove, tacticKey, half = false }) {
  const pitchRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [movingPlayer, setMovingPlayer] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);

  // ── Drop from sidebar ──────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const playerId = e.dataTransfer.getData('playerId');
    if (!playerId) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width * 100;
    const yPct = (e.clientY - rect.top) / rect.height * 100;
    const clampedX = Math.max(3, Math.min(97, xPct));
    const clampedY = Math.max(3, Math.min(97, yPct));

    onDrop(playerId, clampedX, clampedY, tacticKey);
  }, [onDrop, tacticKey]);

  // ── Move already-placed players ───────────────────────────
  const handlePlayerMouseDown = useCallback((e, player) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = pitchRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - (player.x / 100 * rect.width);
    const offsetY = e.clientY - rect.top - (player.y / 100 * rect.height);
    setMovingPlayer({ id: player.id, offsetX, offsetY });
    setGhostPos({ x: player.x, y: player.y, name: player.name });
  }, []);

  useEffect(() => {
    if (!movingPlayer) return;

    const handleWindowMouseMove = (e) => {
      if (!pitchRef.current) return;
      const rect = pitchRef.current.getBoundingClientRect();
      const xPct = (e.clientX - rect.left - movingPlayer.offsetX) / rect.width * 100;
      const yPct = (e.clientY - rect.top - movingPlayer.offsetY) / rect.height * 100;
      const cx = Math.max(3, Math.min(97, xPct));
      const cy = Math.max(3, Math.min(97, yPct));
      setGhostPos(g => ({ ...g, x: cx, y: cy }));
    };

    const handleWindowMouseUp = (e) => {
      if (!pitchRef.current) {
        setMovingPlayer(null);
        setGhostPos(null);
        return;
      }
      const rect = pitchRef.current.getBoundingClientRect();
      const xPct = (e.clientX - rect.left - movingPlayer.offsetX) / rect.width * 100;
      const yPct = (e.clientY - rect.top - movingPlayer.offsetY) / rect.height * 100;
      const cx = Math.max(3, Math.min(97, xPct));
      const cy = Math.max(3, Math.min(97, yPct));
      onPlayerMove(movingPlayer.id, cx, cy, tacticKey);
      setMovingPlayer(null);
      setGhostPos(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [movingPlayer, onPlayerMove, tacticKey]);

  // ViewBox: Full pitch is 200x280. Half pitch (attacking half) is 200x142.
  const svgViewBox = half ? '0 0 200 142' : '0 0 200 280';

  return (
    <div
      className={`pitch-wrapper${dragOver ? ' drop-active' : ''}${half ? ' pitch-half' : ''}`}
      ref={pitchRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ userSelect: 'none' }}
    >
      {/* Pitch SVG Graphic */}
      <svg
        className="pitch-svg"
        viewBox={svgViewBox}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grass background */}
        <rect className="pitch-bg" width="200" height="280" fill="#12502f" />

        {/* Alternating grass stripes */}
        {Array.from({ length: 7 }).map((_, i) => (
          <rect
            key={i}
            className="pitch-bg"
            x="0"
            y={i * 40}
            width="200"
            height="20"
            fill={i % 2 === 0 ? '#155e37' : '#12502f'}
          />
        ))}

        {/* Boundary Lines */}
        {half ? (
          <>
            <line className="pitch-line" x1="6" y1="6" x2="6" y2="140" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <line className="pitch-line" x1="6" y1="6" x2="194" y2="6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <line className="pitch-line" x1="194" y1="6" x2="194" y2="140" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <line className="pitch-line" x1="6" y1="140" x2="194" y2="140" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <path className="pitch-line" d="M 72 140 A 28 28 0 0 1 128 140" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
          </>
        ) : (
          <>
            <rect className="pitch-line" x="6" y="6" width="188" height="268" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <line className="pitch-line" x1="6" y1="140" x2="194" y2="140" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <circle className="pitch-line" cx="100" cy="140" r="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <circle className="pitch-dot" cx="100" cy="140" r="2" fill="rgba(255,255,255,0.85)" />
          </>
        )}

        {/* Penalty Area TOP */}
        <rect className="pitch-line" x="42" y="6" width="116" height="44" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
        <rect className="pitch-line" x="72" y="6" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
        <rect className="pitch-line" x="84" y="2" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
        <circle className="pitch-dot" cx="100" cy="38" r="1.5" fill="rgba(255,255,255,0.85)" />
        <path className="pitch-line" d="M 72 50 A 28 28 0 0 1 128 50" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
        <path className="pitch-line" d="M 6 16 A 10 10 0 0 1 16 6" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
        <path className="pitch-line" d="M 184 6 A 10 10 0 0 1 194 16" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />

        {/* Bottom half — rendered only when full pitch */}
        {!half && (
          <>
            <rect className="pitch-line" x="42" y="230" width="116" height="44" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <rect className="pitch-line" x="72" y="256" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <rect className="pitch-line" x="84" y="272" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <circle className="pitch-dot" cx="100" cy="242" r="1.5" fill="rgba(255,255,255,0.85)" />
            <path className="pitch-line" d="M 72 230 A 28 28 0 0 0 128 230" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <path className="pitch-line" d="M 6 264 A 10 10 0 0 0 16 274" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <path className="pitch-line" d="M 184 274 A 10 10 0 0 0 194 264" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
          </>
        )}
      </svg>


      {/* Players on Field */}
      {players.map((player) => {
        const isMoving = movingPlayer && movingPlayer.id === player.id;
        const displayX = isMoving ? ghostPos.x : player.x;
        const displayY = isMoving ? ghostPos.y : player.y;

        return (
          <div
            key={player.id}
            className="field-player"
            style={{ left: `${displayX}%`, top: `${displayY}%` }}
            onMouseDown={(e) => handlePlayerMouseDown(e, player)}
          >
            <div className="field-player-pin">
              {player.number || '•'}
            </div>
            <div className="field-player-label">
              {player.name}
            </div>
            <button
              className="field-player-remove no-print"
              onClick={(e) => { e.stopPropagation(); onPlayerRemove(player.id, tacticKey); }}
              title="Quitar de la cancha"
            >×</button>
          </div>
        );
      })}
    </div>
  );
}
