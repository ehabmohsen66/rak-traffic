import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, SendEmailPayload } from '@/lib/emailService';
import { getErrorMessage } from '@/lib/errors';
import { EmailConfig } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { payload?: SendEmailPayload; config?: EmailConfig };
    const { payload, config } = body;

    if (!payload || !payload.to || !payload.subject) {
      return NextResponse.json(
        { error: 'Missing required email payload fields (to, subject, html/text)' },
        { status: 400 }
      );
    }

    const result = await sendEmail(payload, config);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Internal server error while sending email') },
      { status: 500 }
    );
  }
}
