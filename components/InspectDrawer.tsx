'use client';

import React from 'react';
import { AgentRecord } from '@/lib/state';

interface InspectDrawerProps {
  entityId: string | null;
  agent: AgentRecord | null;
  onClose: () => void;
}

const mascotIcons: Record<string, string> = {
  aaron: '👑',
  jordan: '🐻',
  michael: '🦫',
  michelle: '🦊',
  coordinator: '🦉',
  barista: '🐰',
  scribe: '🐱',
  caretaker: '🦦',
};

const personaDescriptions: Record<string, { desc: string; tags: string[] }> = {
  aaron: {
    desc: 'Red Panda Director with gold spectacles and espresso cup, conducting inspections across the campus.',
    tags: ['Architecture', 'Sprint Review', 'OMP Supervisor'],
  },
  jordan: {
    desc: 'Cozy flannel-clad bear maintaining microservices, Redis caching, and backend API contracts.',
    tags: ['FastAPI', 'Redis', 'TypeScript', 'Node.js'],
  },
  michael: {
    desc: 'Hardhat beaver drafting normalized schemas, indexing strategies, and database architecture.',
    tags: ['PostgreSQL', 'SQL Optimization', 'Migrations', 'ERD'],
  },
  michelle: {
    desc: 'Calico fox in pastel sweater crafting responsive interfaces, Next.js components, and 3D scenes.',
    tags: ['Next.js', 'React', 'Three.js', 'Tailwind CSS'],
  },
  coordinator: {
    desc: 'Cyber owl residing in the High-Tech Server Room presiding over dispatch waves and server racks.',
    tags: ['OMP Parent Engine', 'Task Routing', 'Subagent Mesh'],
  },
  barista: {
    desc: 'Artisanal bunny barista serving matcha lattes and pour-over coffee to keep developers energized.',
    tags: ['NPC', 'Espresso', 'Matcha', 'Wellness'],
  },
  scribe: {
    desc: 'Wise cat librarian shelving documentation binders and maintaining knowledge archives.',
    tags: ['NPC', 'Archives', 'Documentation', 'Notes'],
  },
  caretaker: {
    desc: 'Peaceful otter gardener tending to the indoor bamboo planters and raking stone pebble paths.',
    tags: ['NPC', 'Indoor Garden', 'Bonsai', 'Zen'],
  },
};

export default function InspectDrawer({ entityId, agent, onClose }: InspectDrawerProps) {
  if (!entityId || !agent) return null;

  const icon = mascotIcons[entityId] || '🐾';
  const persona = personaDescriptions[entityId] || { desc: agent.currentTask, tags: ['AI Workspace'] };

  return (
    <aside className="inspect-drawer open hud-interactive">
      <div className="drawer-header">
        <div className="drawer-title">
          <div className="drawer-avatar">{icon}</div>
          <div className="drawer-names">
            <h3>{agent.name}</h3>
            <p>{agent.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="close-btn" title="Close drawer">&times;</button>
      </div>

      <div className="drawer-body">
        {/* Operational Reality */}
        <div className="drawer-card">
          <h4>Operational Reality</h4>
          {agent.isNPC ? (
            <div className="status-indicator-badge decorative" style={{ background: 'rgba(74, 124, 89, 0.12)', color: '#2b5839', borderColor: 'rgba(74, 124, 89, 0.3)' }}>
              NPC &middot; Campus Service
            </div>
          ) : agent.verifiedActive ? (
            <div className="status-indicator-badge verified">
              ● VERIFIED ACTIVE: <code>{agent.activeTool || 'tool_exec'}</code>
            </div>
          ) : (
            <div className="status-indicator-badge decorative">
              ○ Idle &middot; Decorative Routine
            </div>
          )}

          <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.4, color: 'var(--text-main)' }}>
            {agent.verifiedActive
              ? `Currently executing verified tool: ${agent.activeTool} on the live workspace.`
              : agent.currentTask}
          </p>
          <p style={{ fontSize: '10px', marginTop: '5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {agent.isNPC
              ? 'Stationary / Waypoint NPC providing campus atmosphere.'
              : agent.verifiedActive
              ? 'Active signal verified via ~/.omp/agent/extensions/virtual-office.ts'
              : 'Decorative routine. Real tools light up upon verified telemetry payload.'}
          </p>
        </div>

        {/* Persona & Routine */}
        <div className="drawer-card">
          <h4>Character &amp; Routine</h4>
          <p style={{ fontSize: '12px', lineHeight: 1.4 }}>{persona.desc}</p>
          <div className="tag-list" style={{ marginTop: '8px' }}>
            {persona.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        {/* Fresh Incubator Workspace (No Old Projects) */}
        {!agent.isNPC && (
          <div className="drawer-card">
            <h4>Active Incubator Slot</h4>
            <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>
              {entityId === 'coordinator' ? 'Subterranean Mesh Control' : 'Project Genesis (New Sprint)'}
            </strong>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Fresh workspace ready to capture new code, database tables, and UI components from live OMP sessions.
            </p>
            <div className="tag-list" style={{ marginTop: '6px' }}>
              <span className="tag">Clean Workspace</span>
              <span className="tag">Next.js 14</span>
              <span className="tag">Three.js</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
