'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import HUD from '@/components/HUD';
import InspectDrawer from '@/components/InspectDrawer';
import { LoFiAudioSystem } from '@/lib/audio';
import { AgentRecord } from '@/lib/state';

// Dynamically import Three.js canvas with SSR disabled
const OfficeCanvas = dynamic(() => import('@/components/OfficeCanvas'), { ssr: false });

export default function WorkspacePage() {
  const [viewMode, setViewMode] = useState<'iso' | 'step'>('iso');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [agentMap, setAgentMap] = useState<Record<string, AgentRecord>>({});
  const [statusText, setStatusText] = useState('Status: Listening on POST /api/events');
  const [isLive, setIsLive] = useState(false);

  const audioRef = useRef<LoFiAudioSystem | null>(null);
  if (!audioRef.current) {
    audioRef.current = new LoFiAudioSystem();
  }

  // Continuous Real-Time State Sync (SSE Stream + 1.2s Polling fallback)
  useEffect(() => {
    const syncStatus = () => {
      fetch('/api/status')
        .then((r) => r.json())
        .then((data) => {
          if (data.agentStates) setAgentMap(data.agentStates);
        })
        .catch(() => {});
    };

    syncStatus();
    const pollTimer = setInterval(syncStatus, 1200);

    const sse = new EventSource('/api/events/stream');
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.agentStates) setAgentMap(data.agentStates);
        if (data.record) {
          setStatusText(`Live: ${data.record.agentDisplayName} -> ${data.record.event} (${data.record.toolName || ''})`);
          setIsLive(true);
          setTimeout(() => setIsLive(false), 4000);
        }
      } catch (err) {
        console.warn('SSE parse error:', err);
      }
    };

    return () => {
      clearInterval(pollTimer);
      sse.close();
    };
  }, []);


  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
  };

  const handleFocusRoom = (roomKey: string) => {
    setActiveRoom(roomKey);
  };


  const selectedAgent = selectedEntityId ? agentMap[selectedEntityId] || null : null;

  return (
    <main className="w-full h-full relative overflow-hidden">
      {/* 3D WebGL Canvas */}
      <OfficeCanvas
        viewMode={viewMode}
        activeRoom={activeRoom}
        onSelectEntity={handleSelectEntity}
        audio={audioRef.current}
        onStatusChange={(text, live) => {
          setStatusText(text);
          setIsLive(live);
        }}
      />

      {/* Glassmorphic HUD */}
      <HUD
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onRotateCamera={() => {}}
        onFocusRoom={handleFocusRoom}
        audio={audioRef.current}
        statusText={statusText}
        isLive={isLive}
      />

      {/* Interactive Inspect Drawer */}
      <InspectDrawer
        entityId={selectedEntityId}
        agent={selectedAgent}
        onClose={() => setSelectedEntityId(null)}
      />


      {/* On-Screen D-Pad for Step Inside Mode */}
      {viewMode === 'step' && (
        <div
          className="mobile-controls hud-interactive"
          style={{ display: 'flex', position: 'absolute', bottom: '85px', left: '20px', zIndex: 25 }}
        >
          <button
            className="dpad-btn"
            onMouseDown={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('forward', true)}
            onMouseUp={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('forward', false)}
            onTouchStart={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('forward', true)}
            onTouchEnd={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('forward', false)}
            title="Walk Forward (W / Up)"
          >
            ▲
          </button>
          <div className="dpad-row">
            <button
              className="dpad-btn"
              onMouseDown={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('left', true)}
              onMouseUp={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('left', false)}
              onTouchStart={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('left', true)}
              onTouchEnd={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('left', false)}
              title="Turn Left (A / Left)"
            >
              ◀
            </button>
            <button
              className="dpad-btn"
              onMouseDown={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('backward', true)}
              onMouseUp={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('backward', false)}
              onTouchStart={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('backward', true)}
              onTouchEnd={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('backward', false)}
              title="Walk Backward (S / Down)"
            >
              ▼
            </button>
            <button
              className="dpad-btn"
              onMouseDown={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('right', true)}
              onMouseUp={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('right', false)}
              onTouchStart={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('right', true)}
              onTouchEnd={() => (window as unknown as { __moveAaron?: (dir: string, a: boolean) => void }).__moveAaron?.('right', false)}
              title="Turn Right (D / Right)"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
