import { NextResponse } from 'next/server';
import { workspaceState } from '@/lib/state';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    agentStates: workspaceState.agents,
    recentEvents: workspaceState.events.slice(0, 15),
    incubatorSlots: workspaceState.incubatorSlots,
    time: new Date().toISOString(),
  });
}
