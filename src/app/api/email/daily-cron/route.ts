import { NextRequest, NextResponse } from 'next/server';
import { runDailyDeadlineScan } from '@/lib/emailDailyScanner';
import { INITIAL_USERS, INITIAL_CLIENTS, INITIAL_TASKS } from '@/lib/mockData';
import { DEFAULT_EMAIL_CONFIG } from '@/lib/emailService';
import { EmailConfig, Task, User, Client } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error running daily cron scan' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error running daily cron scan' },
      { status: 500 }
    );
  }
}
