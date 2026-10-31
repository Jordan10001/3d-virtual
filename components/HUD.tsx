'use client';

import React from 'react';
import { LoFiAudioSystem } from '@/lib/audio';

interface HUDProps {
  viewMode: 'iso' | 'step';
  onSetViewMode: (mode: 'iso' | 'step') => void;
  onRotateCamera: (angleDelta: number) => void;
  onFocusRoom: (roomKey: string) => void;
  audio: LoFiAudioSystem;
  statusText: string;
  isLive: boolean;
}

export default function HUD({
  viewMode,
  onSetViewMode,
  onRotateCamera,
  onFocusRoom,
  audio,
  statusText,
  isLive,
}: HUDProps) {
  const [isPlaying, setIsPlaying] = React.useState(audio.isPlaying);
  const [isMuted, setIsMuted] = React.useState(audio.isMuted);

  const toggleMusic = () => {
    const active = audio.toggleMusic();
    setIsPlaying(active);
  };

  const toggleMute = () => {
    const muted = audio.setMute(!isMuted);
    setIsMuted(muted);
  };

  return (
    <div className="hud-layer">
      {/* Top Bar */}
      <header className="top-bar hud-interactive">
        <div className="brand-section">
          <div className="brand-logo">🏢</div>
          <h1 className="brand-title">Cozy Office</h1>
        </div>

        {/* View Modes */}
        <div className="view-modes">
          <button
            onClick={() => onSetViewMode('iso')}
            className={`mode-btn ${viewMode === 'iso' ? 'active' : ''}`}
            title="Isometric Whole Campus View"
          >
            <span>⊞</span> Isometric
          </button>
          <button
            onClick={() => onSetViewMode('step')}
            className={`mode-btn ${viewMode === 'step' ? 'active' : ''}`}
            title="Step Inside Mode (WASD Walk)"
          >
            <span>🚶</span> Step Inside
          </button>
        </div>

        {/* Audio & Sim Controls */}
        <div className="quick-controls">
          {/* Audio Widget */}
          <div className="audio-widget">
            <button onClick={toggleMusic} className={`icon-btn ${isPlaying ? 'active' : ''}`} title="Play Lo-Fi Beats">
              {isPlaying ? '⏸ Pause' : '🎵 Lo-Fi'}
            </button>
            <button onClick={toggleMute} className="icon-btn" title="Mute Toggle">
              {isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.5"
              onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              title="Volume"
            />
          </div>

        </div>
      </header>

      {/* Step Inside Hint */}
      {viewMode === 'step' && (
        <div className="step-inside-hint">
          🚶 Step Inside Mode: Use <strong>WASD / Arrow Keys</strong> to walk around as Aaron.
        </div>
      )}

      {/* Bottom Bar: Room Pills & Live Status */}
      <footer className="bottom-bar">
        <div className="bottom-bar-top-row">
          <div className="telemetry-badge">
            <div className={`pulse-dot ${isLive ? '' : 'idle'}`} />
            <div>
              <span style={{ fontWeight: 600 }}>{statusText}</span>
              <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)' }}>
                Live Hook: ~/.omp/agent/extensions/virtual-office.ts
              </span>
            </div>
          </div>
        </div>

        <nav className="room-pills">
          <button onClick={() => onFocusRoom('supervisor')} className="room-pill-btn">👑 Supervisor Suite</button>
          <button onClick={() => onFocusRoom('server')} className="room-pill-btn">🔮 Server Room</button>
          <button onClick={() => onFocusRoom('engineering')} className="room-pill-btn">💻 Engineering Hub</button>
          <button onClick={() => onFocusRoom('library')} className="room-pill-btn">📚 Knowledge Library</button>
          <button onClick={() => onFocusRoom('cafe')} className="room-pill-btn">☕ Café Lounge</button>
          <button onClick={() => onFocusRoom('garden')} className="room-pill-btn">🎋 Zen Garden &amp; Arcade</button>
        </nav>
      </footer>
    </div>
  );
}
