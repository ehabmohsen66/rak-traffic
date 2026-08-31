import { NextRequest, NextResponse } from 'next/server';
import { getServerState, updateUserOnServer, saveUserAvatarFile } from '@/lib/serverStore';
import { getErrorMessage } from '@/lib/errors';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const state = await getServerState();
    const user = state.users.find((u: User) => u.id === id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to fetch user') },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<User> = await req.json();

    // If avatar was passed as base64 data, save it to disk as file
    if (updates.avatar && updates.avatar.startsWith('data:image')) {
      try {
        const savedUrl = await saveUserAvatarFile(id, updates.avatar);
        updates.avatar = savedUrl;
      } catch (avatarErr) {
        console.error('Failed to save avatar image file:', avatarErr);
        // Keep base64 or fallback
      }
    }

    const { user, state } = await updateUserOnServer(id, updates);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user, state });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to update user profile') },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}
