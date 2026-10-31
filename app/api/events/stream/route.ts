import { NextRequest } from 'next/server';
import { workspaceState, TelemetryEvent, AgentRecord } from '@/lib/state';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial state snapshot
      const initialPayload = JSON.stringify({
        type: 'init',
        agentStates: workspaceState.agents,
        eventHistory: workspaceState.events.slice(0, 20),
        incubatorSlots: workspaceState.incubatorSlots,
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // 2. Register live listener
      const listener = (event: TelemetryEvent, agents: Record<string, AgentRecord>) => {
        try {
          const payload = JSON.stringify({
            record: event,
            agentStates: agents,
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch {
          workspaceState.listeners.delete(listener);
        }
      };

      workspaceState.listeners.add(listener);

      // Clean up when request closes
      req.signal.addEventListener('abort', () => {
        workspaceState.listeners.delete(listener);
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
