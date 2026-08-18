import { NextRequest, NextResponse } from 'next/server';
import { sendTestNotification } from '@/lib/emailService';
import { EmailConfig } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      recipientName, 
      recipientEmail, 
      config 
    }: { 
      recipientName: string; 
      recipientEmail: string; 
      config?: EmailConfig 
    } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const result = await sendTestNotification(
      { recipientName: recipientName || 'Team Member', recipientEmail, baseUrl },
      config
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error sending test email' },
      { status: 500 }
    );
  }
}
