// In-Memory Shared State & Telemetry History for Next.js App Router

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  mascot: string;
  room: string;
  status: 'idle' | 'working' | 'inspecting' | 'brewing' | 'shelving' | 'gardening' | 'error';
  verifiedActive: boolean;
  activeTool: string | null;
  currentTask: string;
  lastEventTime: string | null;
  isRealConnection: boolean;
  isNPC?: boolean;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  event: string;
  agent: string;
  agentDisplayName: string;
  toolName: string | null;
  status: string;
  isError: boolean;
  source: string;
  isRealConnection: boolean;
  data: Record<string, unknown>;
}

export interface IncubatorProject {
  id: string;
  name: string;
  status: string;
  description: string;
  bay: string;
  activeTasks: number;
}

interface GlobalWorkspaceState {
  agents: Record<string, AgentRecord>;
  events: TelemetryEvent[];
  incubatorSlots: IncubatorProject[];
  listeners: Set<(event: TelemetryEvent, agents: Record<string, AgentRecord>) => void>;
}

const defaultAgents: Record<string, AgentRecord> = {
  aaron: {
    id: 'aaron',
    name: 'Aaron Jordan',
    role: 'Supervisor & Director',
    mascot: 'Red Panda',
    room: 'supervisor_suite',
    status: 'inspecting',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Overseeing workspace launch & team readiness',
    lastEventTime: new Date().toISOString(),
    isRealConnection: false,
  },
  jordan: {
    id: 'jordan',
    name: 'Jordan',
    role: 'Senior Backend Engineer',
    mascot: 'Flannel Bear',
    room: 'engineering_hub',
    status: 'idle',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Waiting for backend sprint dispatch',
    lastEventTime: null,
    isRealConnection: false,
  },
  michael: {
    id: 'michael',
    name: 'Michael',
    role: 'Senior Database Engineer',
    mascot: 'Hardhat Beaver',
    room: 'engineering_hub',
    status: 'idle',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Schema drafting board ready for new tables',
    lastEventTime: null,
    isRealConnection: false,
  },
  michelle: {
    id: 'michelle',
    name: 'Michelle',
    role: 'Senior Frontend Engineer',
    mascot: 'Calico Fox',
    room: 'engineering_hub',
    status: 'idle',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Component viewport canvas initialized',
    lastEventTime: null,
    isRealConnection: false,
  },
  coordinator: {
    id: 'coordinator',
    name: 'The Coordinator',
    role: 'Parent Orchestrator & Scout',
    mascot: 'Cyber Owl',
    room: 'server_room',
    status: 'idle',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'High-tech server room console active & monitoring dispatch mesh',
    lastEventTime: null,
    isRealConnection: false,
  },
  // NPCs
  barista: {
    id: 'barista',
    name: 'Bunny Barista',
    role: 'Café Craftsman (NPC)',
    mascot: 'Bunny',
    room: 'cafe_lounge',
    status: 'brewing',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Steaming vanilla matcha & espresso',
    lastEventTime: new Date().toISOString(),
    isRealConnection: false,
    isNPC: true,
  },
  scribe: {
    id: 'scribe',
    name: 'Cat Scribe',
    role: 'Library Archivist (NPC)',
    mascot: 'Siamese Cat',
    room: 'knowledge_library',
    status: 'shelving',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Organizing clean documentation binders & archives',
    lastEventTime: new Date().toISOString(),
    isRealConnection: false,
    isNPC: true,
  },
  caretaker: {
    id: 'caretaker',
    name: 'Otter Caretaker',
    role: 'Zen Garden Keeper (NPC)',
    mascot: 'Otter',
    room: 'cafe_lounge',
    status: 'gardening',
    verifiedActive: false,
    activeTool: null,
    currentTask: 'Watering indoor bamboo & raking pebble paths',
    lastEventTime: new Date().toISOString(),
    isRealConnection: false,
    isNPC: true,
  }
};

// Fresh Incubator Slots (without old past projects)
const defaultIncubatorSlots: IncubatorProject[] = [
  {
    id: 'sprint-genesis',
    name: 'Project Genesis (New Sprint)',
    status: 'Ready for Dispatch',
    description: 'Clean incubator bay awaiting the first feature or system prompt from the director.',
    bay: 'Bay Alpha',
    activeTasks: 0,
  },
  {
    id: 'proto-lab',
    name: 'Rapid Prototyping Lab',
    status: 'Standby',
    description: 'Sandbox workspace equipped for interactive prototypes and experimental tools.',
    bay: 'Bay Beta',
    activeTasks: 0,
  },
  {
    id: 'arch-board',
    name: 'System Architecture Board',
    status: 'Active Blueprint',
    description: 'Clean central decision board for cross-agent contracts between Jordan, Michael, and Michelle.',
    bay: 'Central Whiteboard',
    activeTasks: 0,
  }
];

// Attach to globalThis to persist across Next.js dev server reloads
const globalStore = globalThis as unknown as { __workspaceState?: GlobalWorkspaceState };

if (!globalStore.__workspaceState) {
  globalStore.__workspaceState = {
    agents: { ...defaultAgents },
    events: [],
    incubatorSlots: [...defaultIncubatorSlots],
    listeners: new Set(),
  };
}

export const workspaceState = globalStore.__workspaceState;

export function broadcastEvent(event: TelemetryEvent) {
  workspaceState.listeners.forEach((listener) => {
    try {
      listener(event, workspaceState.agents);
    } catch {
      workspaceState.listeners.delete(listener);
    }
  });
}

export function processIncomingTelemetry(body: Record<string, unknown>): TelemetryEvent {
  const eventName = String(body.event || 'unknown');
  const identity = (body.identity || {}) as Record<string, unknown>;
  const data = (body.data || {}) as Record<string, unknown>;

  const agentName = String(identity.agentName || identity.agentId || '').toLowerCase();
  const toolName = data.toolName ? String(data.toolName) : null;
  const isError = Boolean(data.isError);
  const status = String(data.status || 'working');

  let targetKey = 'coordinator';
  if (agentName.includes('jordan')) targetKey = 'jordan';
  else if (agentName.includes('michael')) targetKey = 'michael';
  else if (agentName.includes('michelle')) targetKey = 'michelle';

  const record: TelemetryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event: eventName,
    agent: targetKey || 'coordinator',
    agentDisplayName: String(identity.agentName || identity.agentId || 'Coordinating Agent'),
    toolName,
    status,
    isError,
    source: String(body.source || 'oh-my-pi'),
    isRealConnection: true,
    data,
  };

  workspaceState.events.unshift(record);
  if (workspaceState.events.length > 60) workspaceState.events.pop();

  if (targetKey && workspaceState.agents[targetKey]) {
    const ag = workspaceState.agents[targetKey];
    ag.isRealConnection = true;
    ag.lastEventTime = record.timestamp;

    if (
      eventName === 'turn_start' ||
      eventName === 'message_start' ||
      eventName === 'agent_start' ||
      eventName === 'tool_call' ||
      eventName === 'tool_execution_start' ||
      eventName === 'tool_execution_update' ||
      eventName === 'collector_ping'
    ) {
      ag.verifiedActive = true;
      ag.status = 'working';
      ag.activeTool = toolName;
      ag.currentTask = toolName
        ? `Running tool: ${toolName}`
        : eventName === 'collector_ping'
        ? 'Connection ping verified'
        : 'Processing prompt & executing workflow';
    } else if (eventName === 'turn_end' || eventName === 'agent_end') {
      ag.verifiedActive = false;
      ag.status = 'idle';
      ag.activeTool = null;
      ag.currentTask = 'Task completed · Resting at workstation';
    } else if (eventName === 'tool_execution_end' || eventName === 'tool_result') {
      ag.activeTool = null;
      if (isError) ag.status = 'error';
      ag.currentTask = isError ? `Error on tool: ${toolName}` : `Finished: ${toolName}`;
    }
  }

  broadcastEvent(record);
  return record;
}
