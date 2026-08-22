import { NextResponse } from 'next/server';
import { EmailProviderType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const supportedProviders: EmailProviderType[] = [
  'vercel',
  'resend',
  'sendgrid',
  'brevo',
  'webhook',
  'simulated',
];

export async function GET() {
  const configuredProvider = process.env.EMAIL_PROVIDER as EmailProviderType | undefined;
  const provider = configuredProvider && supportedProviders.includes(configuredProvider)
    ? configuredProvider
    : 'simulated';

  const credentialConfigured =
    provider === 'simulated' ||
    ((provider === 'resend' || provider === 'vercel') && Boolean(process.env.RESEND_API_KEY)) ||
    (provider === 'sendgrid' && Boolean(process.env.SENDGRID_API_KEY)) ||
    (provider === 'brevo' && Boolean(process.env.BREVO_API_KEY)) ||
    (provider === 'webhook' && Boolean(process.env.EMAIL_WEBHOOK_URL));

  return NextResponse.json(
    {
      provider: provider === 'vercel' ? 'resend' : provider,
      credentialConfigured,
      deliveryMode: provider === 'simulated' ? 'simulated' : 'live',
      fromName: process.env.EMAIL_FROM_NAME || null,
      fromEmail: process.env.EMAIL_FROM || null,
      replyTo: process.env.EMAIL_REPLY_TO || null,
      allowedDomains: (process.env.EMAIL_ALLOWED_DOMAINS || '')
        .split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
      serverManaged: true,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
