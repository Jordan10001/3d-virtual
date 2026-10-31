# Cozy Office — 3D AI Agent Workspace

A cute, interactive 3D tycoon-inspired workspace where AI coding agents become lively woodland characters with their own rooms, personalities, autonomous routines, and verified real-time telemetry from **Oh-My-Pi (OMP)**.

---

## Architectural Layout (1-Floor Unified Campus)

The entire campus is seamlessly laid out across **a single continuous ground level** ($y = 0$), offering an open, cozy isometric view without cutaways or stairs:

```
┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│        SUPERVISOR SUITE         │      SERVER ROOM & DISPATCH     │         ENGINEERING HUB         │
│  Aaron (Red Panda)              │  The Coordinator (Cyber Owl)    │  Jordan (Bear) · Backend        │
│  Corner panoramic suite,        │  High-tech glass room, server   │  Michael (Beaver) · Database    │
│  mahogany desk, curved monitors │  racks, holographic radar table │  Michelle (Fox) · Frontend      │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│       KNOWLEDGE LIBRARY         │          CAFÉ LOUNGE            │      ZEN GARDEN & ARCADE        │
│  Cat Scribe (NPC)               │  Bunny Barista (NPC)            │  Otter Caretaker (NPC)          │
│  Oak bookcases, study desk,     │  Espresso bar, steam machine,   │  Bamboo planters, stone path,   │
│  rolling ladder & archives      │  pastry cloche, counter stools  │  cozy beanbags, arcade cabinet  │
└─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

### 1. Supervisor Suite (North-West Wing)
- **Occupant**: Aaron Jordan (Avatar: *Red Panda Director* with gold spectacles, beige vest, and espresso mug).
- **Features**: Panoramic glass view, executive mahogany desk, dual curved monitors, bonsai tree, standing review area.
- **Controls**: Primary avatar controlled in **Step Inside** mode via `WASD` / Arrow keys.

### 2. High-Tech Server Room & Coordination Hub (North-Center Wing)
- **Occupant**: The Coordinator (*Cyber Owl* with glowing cyan monocle).
- **Features**: Tempered glass perimeter walls, dark high-tech slate floor (`#1e232d`), cluster mainframe server racks with blue neon diagnostics, and a central circular tactical holographic radar table with rotating cyan rings.
- **Role**: Sits at the center of the campus, presiding over OMP root prompts and multi-agent dispatch mesh.

### 3. Engineering Hub & Sprint Incubators (North-East Wing)
- **Occupants**:
  - **Jordan** (*Senior Backend Bear* in blue flannel hoodie): Dual vertical/horizontal terminal monitors, FastAPI/Redis architecture.
  - **Michael** (*Database Beaver* in yellow construction hardhat): Drafting desk, PostgreSQL/ERD schema logs.
  - **Michelle** (*Frontend Calico Fox* in lavender sweater): Drawing tablet, sit-stand desk, spinning 3D holographic wireframe canvas.
- **Bays**:
  - *Sprint Genesis (Bay Alpha)*: Active sprint bay ready for new feature dispatches.
  - *Prototyping Lab (Bay Beta)*: Design easel and sandbox workbench.
  - *Architecture Board*: Central whiteboard for API and database schemas.

### 4. Knowledge Library & Archives (South-West Wing)
- **Occupant**: Cat Scribe (*NPC*).
- **Features**: Towering oak bookshelves, rolling brass ladder, research study table, brass banker's reading lamps.

### 5. Café Lounge (South-Center Wing)
- **Occupant**: Bunny Barista (*NPC*).
- **Features**: Handcrafted wooden coffee counter, 9-bar espresso machine, steaming milk nozzles, pastry cloche, bar stool seating.

### 6. Zen Garden & Arcade (South-East Wing)
- **Occupant**: Otter Caretaker (*NPC*).
- **Features**: Raked stone pebble garden, bamboo planters, stone pagoda lantern, plush peach and teal beanbags, retro neon arcade cabinet.

---

## Operational Reality: Verified Telemetry vs Decorative Routine

The workspace enforces strict truthfulness: **decorative animations are never conflated with live coding tasks**:

| Status | Visual Cue | What It Means |
| :--- | :--- | :--- |
| **○ Idle · Decorative Routine** | Character softly breathes, walks between waypoints, visits the café, reads in the library, or relaxes on beanbags. | No background tasks are running. The agent is waiting for user input. |
| **● VERIFIED ACTIVE** | Character faces workstation, typing animation begins, bright glowing turquoise halo pulses at their feet, and active tool badge appears overhead (`[bash]`, `[read]`, `[edit]`). | A verified event arrived from OMP via `POST /api/events`. The Inspect Drawer reveals the real-time tool name, task description, and execution timestamp. |

---

## Navigation & Camera Controls

- **Isometric Mode**:
  - **Rotate**: Left-click and drag anywhere on the canvas.
  - **Pan**: Right-click and drag across the screen.
  - **Zoom**: Mouse wheel or touch pinch.
- **Step Inside Mode (` Step Inside`)**:
  - Third-person over-the-shoulder camera trailing Aaron.
  - **Move**: `W` (Forward), `S` (Backward), `A` (Turn Left), `D` (Turn Right) or Arrow keys.
  - **Look Around**: Click and drag mouse horizontally to rotate Aaron's heading.
  - **On-Screen D-Pad**: Click or tap the virtual buttons (`▲`, `◀`, `▼`, `▶`) on mobile and touchscreens.
- **Full-Width Bottom Bar**:
  - Centered navigation pills spanning 100% width without scrollbars: click any department (`Supervisor Suite`, `Server Room`, `Engineering Hub`, etc.) to smoothly glide the camera to that room.
- **Procedural Lo-Fi Audio**:
  - Built with the Web Audio API (zero external audio file dependencies).
  - Procedural jazz chord progression ($F\text{maj}7 \to E\text{m}7 \to D\text{m}7 \to C\text{maj}7$), vinyl surface crackle, keyboard typing clatter, and coffee steam foley with mute toggle and volume slider.
- **Immersive Native UI**:
  - Global text selection is disabled (`user-select: none`) to prevent accidental blue highlight boxes during 3D camera dragging.

---

## How to Launch & Keep Running

### 1. Prerequisites
- **Node.js** (v18+) or **Bun** installed on your system.

### 2. Starting the Workspace Server
Navigate to the project folder:
```bash
cd virtual-office
```

Choose your preferred launch method:

#### Option A: Terminal (Recommended for development)
```bash
bun dev
# or using npm:
npm run dev
# or using pnpm:
pnpm dev
```

#### Option B: Windows Shortcut
Double-click `run.bat` in the project folder.

#### Option C: Background Service (No persistent terminal window)
Using PM2:
```bash
npm install -g pm2
pm2 start "bun dev" --name cozy-office
```
To stop the background service: `pm2 stop cozy-office`.

### 3. Open in Browser
Visit:
```
http://localhost:3000
```
---

### How Data Flows in Real Time:
1. Every time you launch an OMP coding session, OMP loads the extension automatically.
2. When you send a prompt or delegate work to Jordan, Michael, or Michelle:
   - The extension captures lifecycle hooks (`turn_start`, `tool_execution_start`, `tool_result`, `agent_start`, `turn_end`).
   - Telemetry is dispatched via HTTP POST to `http://localhost:3000/api/events`.
3. The Next.js server relays the payload over a **Server-Sent Events (SSE)** stream (`/api/events/stream`) and a 1.2s state synchronizer to the browser.
4. The 3D campus updates within milliseconds: the corresponding agent illuminates, types at their desk, and displays the running tool.

---

## Optional Cloud Deployment & Authentication

By default, local requests to `http://localhost:3000/api/events` require **no token**, providing a frictionless zero-config local experience.

If deploying to a remote cloud host (e.g., Vercel, Railway, VPS):
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Set your secret token:
   ```env
   VO_API_TOKEN=your_custom_secret_token_here
   ```
3. In `.omp\agent\extensions\virtual-office.ts`, update:
   ```typescript
   const endpoint = "https://your-domain/api/events";
   const token = "your_custom_secret_token_here";
   ```
   The server will automatically enforce Bearer token validation on all incoming telemetry.

---

## Project Structure

```
virtual-office\
├── app\
│   ├── api\
│   │   ├── events\
│   │   │   ├── route.ts            # Receives telemetry from OMP extension (with optional Bearer auth)
│   │   │   └── stream\
│   │   │       └── route.ts        # Real-time Server-Sent Events (SSE) stream to browser
│   │   └── status\
│   │       └── route.ts            # Returns current agent states and incubator slots
│   ├── globals.css                 # Glassmorphic pastel theme & full-width layout
│   ├── layout.tsx                  # Root Next.js layout metadata
│   └── page.tsx                    # Main state manager, HUD orchestration & D-Pad
├── components\
│   ├── HUD.tsx                     # Top bar, view mode switch, audio widget & bottom room pills
│   ├── InspectDrawer.tsx           # Character details, verified task telemetry & incubator info
│   └── OfficeCanvas.tsx            # Three.js 3D campus, procedural models, animations & camera
├── lib\
│   ├── audio.ts                    # Procedural Web Audio API Lo-Fi synth & office foley
│   └── state.ts                    # Shared in-memory agent states, incubator slots & event broadcast
├── .env.example                    # Environment variable template for remote deployment
├── .gitignore                      # Git exclusion rules for node_modules, build & .env.local
├── next.config.js                  # Next.js 14 configuration
├── package.json                    # Project metadata & script targets
├── run.bat                         # Quick-launch Windows batch file
└── tsconfig.json                   # TypeScript compiler configuration (ES2020 target)
```
---
## Code For OMP Extension virtual-office.ts
```typescript 
declare const process: {
  pid?: number;
  [key: string]: unknown;
};

interface ExtensionContext {
  ui: {
    notify: (message: string, level?: "info" | "success" | "warn" | "error") => void;
  };
  sessionManager?: {
    getSessionFile?: () => string | null;
    getHeader?: () => Record<string, unknown>;
    getSessionId?: () => string | null;
  };
  model?: {
    id?: string;
    name?: string;
    provider?: string;
  };
  cwd?: string | null;
  [key: string]: unknown;
}

interface ExtensionEvent {
  [key: string]: unknown;
  messages?: unknown[];
  willContinue?: boolean;
  awaitingAsyncWork?: boolean;
  reason?: string;
  previousSessionFile?: string | null;
  newLeafId?: string;
  oldLeafId?: string;
  toolName?: string;
  toolCallId?: string;
  isError?: boolean;
  message?: unknown;
  sessionId?: string;
  agentId?: string;
  agentName?: string;
  parentSessionId?: string;
}

interface ExtensionAPI {
  setLabel: (label: string) => void;
  on: (event: string, handler: (event: ExtensionEvent, ctx?: ExtensionContext) => Promise<void> | void) => void;
  registerCommand: (name: string, config: { description: string; handler: (args: unknown, ctx: ExtensionContext) => Promise<void> | void }) => void;
  logger: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
  getSessionName?: () => string | null;
  getThinkingLevel?: () => string | null;
}

const endpoint = "http://localhost:3000/api/events";
const token = "";
const profile = "default";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value !== null && typeof value === "object"
    ? (value as AnyRecord)
    : {};
}

function readPath(obj: AnyRecord, paths: string[]): unknown {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>(
      (current, key) => {
        if (current !== null && typeof current === "object" && key in current) {
          return (current as Record<string, unknown>)[key];
        }
        return undefined;
      },
      obj,
    );

    if (value !== undefined && value !== null) return value;
  }

  return undefined;
}

function hash(value: string): string {
  let result = 2166136261;

  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }

  return (result >>> 0).toString(16);
}

function sanitize(value: unknown): unknown {
  const json = JSON.stringify(value, (key, item) => {
    if (
      /password|secret|token|authorization|api.?key|private.?key/i.test(key)
    ) {
      return "[REDACTED]";
    }

    if (typeof item === "string") {
      return item
        .replace(
          /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
          "Bearer [REDACTED]",
        )
        .slice(0, 12000);
    }

    return item;
  });

  if (!json) return null;

  try {
    return JSON.parse(json);
  } catch {
    return String(value).slice(0, 12000);
  }
}

function messageSummary(message: unknown) {
  const msg = asRecord(message);
  const content = Array.isArray(msg.content) ? msg.content : [];

  return {
    role: msg.role ?? null,
    messageId: msg.id ?? null,
    contentTypes: content.map((item: AnyRecord) => item?.type ?? "unknown"),
    timestamp: msg.timestamp ?? null,
  };
}

export default function virtualOffice(pi: ExtensionAPI) {
  pi.setLabel("Virtual Office");

  let sequence = 0;
  const runtimeInstanceId = String(typeof process !== "undefined" && process?.pid ? process.pid : Date.now());

  // Metadata dari session OMP yang sedang aktif.
  let runtime: AnyRecord = {
    sessionId: null,
    sessionName: null,
    agentId: null,
    agentName: null,
    parentSessionId: null,
    cwd: null,
    model: null,
    provider: null,
  };

  function getSessionMetadata(ctx: unknown, event?: unknown) {
    const context = asRecord(ctx);
    const evt = asRecord(event);
    const manager = asRecord(context.sessionManager);

    // Ambil informasi dari session manager jika tersedia.
    let sessionFile: string | null = null;

    try {
      if (typeof manager.getSessionFile === "function") {
        sessionFile = manager.getSessionFile() ?? null;
      }
    } catch {
      // Session metadata tidak tersedia.
    }

    let sessionHeader: AnyRecord = {};

    try {
      if (typeof manager.getHeader === "function") {
        sessionHeader = asRecord(manager.getHeader());
      }
    } catch {
      // Header tidak tersedia.
    }

    let sessionName: string | null = null;

    try {
      sessionName = pi.getSessionName?.() ?? null;
    } catch {
      // Nama session belum tersedia.
    }

    const model = asRecord(context.model);
    let thinkingLevel: string | null = null;
    try {
      thinkingLevel = pi.getThinkingLevel?.() ?? null;
    } catch {
      // Runtime metadata is optional.
    }

    const sessionId =
      readPath(evt, ["sessionId", "session.id"]) ??
      (typeof manager.getSessionId === "function" ? manager.getSessionId() : null) ??
      sessionHeader.id ??
      (sessionFile ? `session-${hash(sessionFile)}` : null);

    const agentId =
      readPath(evt, [
        "agentId",
        "agent.id",
        "agent.id",
      ]) ?? null;

    const agentName =
      readPath(evt, [
        "agentName",
        "agent.name",
        "agent.displayName",
      ]) ?? null;

    const parentSessionId =
      readPath(evt, [
        "parentSessionId",
        "parentSession.id",
      ]) ?? null;

    runtime = {
      sessionId,
      sessionName:
        sessionName ??
        sessionHeader.name ??
        null,

      // Jangan menganggap session ID sebagai ID agent asli.
      agentId: agentId ?? null,
      identitySource: agentId ? "omp_agent_id" : sessionId ? "session_fallback" : "unknown",

      agentName: agentName ?? null,

      parentSessionId,

      cwd: context.cwd ?? null,

      model: model.id ?? model.name ?? null,
      provider: model.provider ?? null,

      thinkingLevel,

      runtimeInstanceId,

      profile,
    };

    return {
      ...runtime,
      sessionReason: evt.reason ?? null,
      sessionHeader: sanitize(sessionHeader),
    };
  }

  async function publish(
    eventName: string,
    data: AnyRecord = {},
    ctx?: unknown,
    event?: unknown,
  ): Promise<boolean> {
    if (!endpoint) return false;

    const metadata = ctx
      ? getSessionMetadata(ctx, event)
      : runtime;

    const payload = {
      source: "oh-my-pi",
      contractVersion: 1,
      profile,
      event: eventName,
      sequence: ++sequence,
      eventId: `${runtimeInstanceId}-${sequence}-${Date.now()}`,
      timestamp: new Date().toISOString(),

      identity: metadata,

      data: sanitize(data),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        pi.logger.warn(
          `Virtual Office HTTP ${response.status}: ${eventName}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      pi.logger.warn(
        `Virtual Office: ${String(error)}`,
      );

      return false;
    }
  }

  // --------------------------------------------------
  // SESSION EVENTS
  // --------------------------------------------------

  pi.on("session_start", async (event, ctx) => {
    await publish("session_start", {}, ctx, event);
  });

  pi.on("session_switch", async (event, ctx) => {
    await publish("session_switch", { reason: event.reason, previousSessionFile: event.previousSessionFile ?? null }, ctx, event);
  });

  pi.on("session_branch", async (event, ctx) => {
    await publish("session_branch", { reason: event.reason ?? null }, ctx, event);
  });

  pi.on("session_tree", async (event, ctx) => {
    await publish("session_tree", { newLeafId: event.newLeafId, oldLeafId: event.oldLeafId }, ctx, event);
  });

  pi.on("session_shutdown", async (event, ctx) => {
    await publish("session_shutdown", {}, ctx, event);
  });

  // --------------------------------------------------
  // AGENT EVENTS
  // --------------------------------------------------

  pi.on("agent_start", async (event, ctx) => {
    await publish(
      "agent_start",
      { status: "working" },
      ctx,
      event,
    );
  });

  pi.on("agent_end", async (event, ctx) => {
    await publish(
      "agent_end",
      {
        messageCount: event.messages?.length ?? null,
        status: event.willContinue || event.awaitingAsyncWork ? "thinking" : "completed",
      },
      ctx,
      event,
    );
  });

  // --------------------------------------------------
  // TURN EVENTS
  // --------------------------------------------------

  pi.on("turn_start", async (event, ctx) => {
    await publish("turn_start", { status: "working" }, ctx, event);
  });

  pi.on("turn_end", async (event, ctx) => {
    await publish("turn_end", { status: "idle" }, ctx, event);
  });

  // --------------------------------------------------
  // MESSAGE EVENTS
  // --------------------------------------------------

  pi.on("message_start", async (event, ctx) => {
    await publish(
      "message_start",
      {
        message: messageSummary(event.message),
      },
      ctx,
      event,
    );
  });

  pi.on("message_end", async (event, ctx) => {
    await publish(
      "message_end",
      {
        message: messageSummary(event.message),
      },
      ctx,
      event,
    );
  });

  // --------------------------------------------------
  // TOOL EVENTS
  // --------------------------------------------------

  pi.on("tool_call", async (event, ctx) => {
    await publish(
      "tool_call",
      {
        toolName: event.toolName,
        toolCallId: event.toolCallId,
        status: "running",
      },
      ctx,
      event,
    );
  });

  pi.on("tool_result", async (event, ctx) => {
    await publish(
      "tool_result",
      {
        toolName: event.toolName,
        toolCallId: event.toolCallId,
        isError: event.isError ?? false,
        status: event.isError ? "error" : "completed",
      },
      ctx,
      event,
    );
  });

  pi.on("tool_execution_start", async (event, ctx) => {
    await publish(
      "tool_execution_start",
      {
        toolName: event.toolName,
        toolCallId: event.toolCallId,
        status: "running",
      },
      ctx,
      event,
    );
  });

  pi.on("tool_execution_update", async (event, ctx) => {
    await publish(
      "tool_execution_update",
      {
        toolName: event.toolName,
        toolCallId: event.toolCallId,
        status: "running",
      },
      ctx,
      event,
    );
  });

  pi.on("tool_execution_end", async (event, ctx) => {
    await publish(
      "tool_execution_end",
      {
        toolName: event.toolName,
        toolCallId: event.toolCallId,
        isError: event.isError,
      },
      ctx,
      event,
    );
  });

  // --------------------------------------------------
  // RETRY AND COMPACTION
  // --------------------------------------------------

  pi.on("auto_retry_start", async (event, ctx) => {
    await publish("auto_retry_start", { status: "retrying" }, ctx, event);
  });

  pi.on("auto_retry_end", async (event, ctx) => {
    await publish("auto_retry_end", { status: "working" }, ctx, event);
  });

  pi.on("auto_compaction_start", async (event, ctx) => {
    await publish(
      "auto_compaction_start",
      { status: "compacting" },
      ctx,
      event,
    );
  });

  pi.on("auto_compaction_end", async (event, ctx) => {
    await publish(
      "auto_compaction_end",
      { status: "working" },
      ctx,
      event,
    );
  });

  // --------------------------------------------------
  // OTHER AGENT EVENTS
  // --------------------------------------------------

  pi.on("todo_reminder", async (event, ctx) => {
    await publish("todo_reminder", { status: "reminder" }, ctx, event);
  });

  pi.on("goal_updated", async (event, ctx) => {
    await publish("goal_updated", { status: "updated" }, ctx, event);
  });

  pi.on("ttsr_triggered", async (event, ctx) => {
    await publish("ttsr_triggered", { status: "triggered" }, ctx, event);
  });

  // --------------------------------------------------
  // MANUAL CONNECTION TEST
  // --------------------------------------------------

  pi.registerCommand("vo-ping", {
    description: "Test Virtual Office connection",

    handler: async (_args, ctx) => {
      const success = await publish(
        "collector_ping",
        {
          message: "Virtual Office connection test",
        },
        ctx,
      );

      ctx.ui.notify(
        success
          ? "Virtual Office connected successfully"
          : "Virtual Office connection failed",
        success ? "success" : "error",
      );
    },
  });

  pi.logger.info("Virtual Office extension loaded");
}

```

