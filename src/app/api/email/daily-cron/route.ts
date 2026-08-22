import { NextRequest, NextResponse } from 'next/server';
import { runDailyDeadlineScan } from '@/lib/emailDailyScanner';
import { INITIAL_USERS, INITIAL_CLIENTS, INITIAL_TASKS } from '@/lib/mockData';
import { DEFAULT_EMAIL_CONFIG } from '@/lib/emailService';
import { getPublicBaseUrl } from '@/lib/requestUrl';
import { getErrorMessage } from '@/lib/errors';
import { EmailConfig, Task, User, Client } from '@/lib/types';

function isAuthorized(req: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;

  // Never expose a production cron endpoint without an explicit secret.
  if (!expectedSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authorization = req.headers.get('authorization');
  const headerSecret = req.headers.get('x-cron-secret');
  return authorization === `Bearer ${expectedSecret}` || headerSecret === expectedSecret;
}

function unauthorizedResponse() {
  const status = process.env.CRON_SECRET ? 401 : 503;
  const error = process.env.CRON_SECRET
    ? 'Unauthorized cron request'
    : 'CRON_SECRET is not configured on the server';

  return NextResponse.json({ error }, { status });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return unauthorizedResponse();
  }

  try {
    const baseUrl = getPublicBaseUrl(req);

    // Run scan with tasks
    const scanResult = await runDailyDeadlineScan({
      tasks: INITIAL_TASKS,
      users: INITIAL_USERS,
      clients: INITIAL_CLIENTS,
      config: DEFAULT_EMAIL_CONFIG,
      baseUrl
    });

    return NextResponse.json({
      message: 'Daily deadline email scan executed successfully.',
      ...scanResult
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error running daily cron scan') },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const { 
      tasks, 
      users, 
      clients, 
      config 
    }: { 
      tasks?: Task[]; 
      users?: User[]; 
      clients?: Client[]; 
      config?: EmailConfig 
    } = body;

    const baseUrl = getPublicBaseUrl(req);

    const scanResult = await runDailyDeadlineScan({
      tasks: tasks || INITIAL_TASKS,
      users: users || INITIAL_USERS,
      clients: clients || INITIAL_CLIENTS,
      config: config || DEFAULT_EMAIL_CONFIG,
      baseUrl
    });

    return NextResponse.json({
      message: 'Daily deadline email scan completed.',
      ...scanResult
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error running daily cron scan') },
      { status: 500 }
    );
  }
}
