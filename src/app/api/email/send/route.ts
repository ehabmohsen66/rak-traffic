import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';
import { EmailConfig } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, config }: { payload: any; config?: EmailConfig } = body;

    if (!payload || !payload.to || !payload.subject) {
      return NextResponse.json(
        { error: 'Missing required email payload fields (to, subject, html/text)' },
        { status: 400 }
      );
    }

    const result = await sendEmail(payload, config);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error while sending email' },
      { status: 500 }
    );
  }
}
