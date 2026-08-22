import { NextRequest } from 'next/server';

export function getPublicBaseUrl(req: NextRequest): string {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProtocol = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const host = forwardedHost || req.headers.get('host');
  const requestUrl = new URL(req.url);

  if (!host) {
    return requestUrl.origin;
  }

  const protocol = forwardedProtocol || requestUrl.protocol.replace(':', '');
  return `${protocol}://${host}`;
}
