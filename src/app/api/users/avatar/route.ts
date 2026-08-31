import { NextRequest, NextResponse } from 'next/server';
import { saveUserAvatarFile, updateUserOnServer } from '@/lib/serverStore';
import { getErrorMessage } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, avatarData }: { userId: string; avatarData: string } = body;

    if (!userId || !avatarData) {
      return NextResponse.json(
        { error: 'Missing userId or avatarData' },
        { status: 400 }
      );
    }

    const avatarUrl = await saveUserAvatarFile(userId, avatarData);
    const { user } = await updateUserOnServer(userId, { avatar: avatarUrl });

    return NextResponse.json({
      success: true,
      avatarUrl,
      user
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to save avatar image') },
      { status: 500 }
    );
  }
}
