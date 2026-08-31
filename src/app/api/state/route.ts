import { NextRequest, NextResponse } from 'next/server';
import { getServerState, persistServerState, updateServerState } from '@/lib/serverStore';
import { getErrorMessage } from '@/lib/errors';
import { AppState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await getServerState();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to fetch server state') },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, partial }: { state?: AppState; partial?: Partial<AppState> } = body;

    let updatedState: AppState;

    if (state && Array.isArray(state.users) && Array.isArray(state.tasks)) {
      // Full state sync
      await persistServerState(state);
      updatedState = state;
    } else if (partial) {
      // Partial state update
      updatedState = await updateServerState((prev) => ({
        ...prev,
        ...partial
      }));
    } else {
      return NextResponse.json(
        { error: 'Invalid state payload' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, state: updatedState });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to save server state') },
      { status: 500 }
    );
  }
}
