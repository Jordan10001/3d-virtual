import { NextRequest, NextResponse } from 'next/server';
import { processIncomingTelemetry } from '@/lib/state';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  // Validasi token otomatis aktif jika VO_API_TOKEN diset di environment / hosting
  const expectedToken = process.env.VO_API_TOKEN;
  if (expectedToken) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing token' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
  }

  try {
    const body = await req.json();
    const record = processIncomingTelemetry(body);

    return NextResponse.json(
      { status: 'ok', recorded: record.id },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
