import { EmailConfig, EmailLog, EmailNotificationType, EmailDeliveryStatus, EmailProviderType, Task, User, Client } from './types';
import { 
  generateTaskAssignedEmail, 
  generateDueTodayEmail, 
  generateOverdueDailyEmail, 
  generateTaskCompletedEmail, 
  generateTestEmail 
} from './emailTemplates';

export interface SendEmailPayload {
  to: { name: string; email: string; id?: string };
  from?: { name: string; email: string };
  subject: string;
  html: string;
  text: string;
  type: EmailNotificationType;
  taskId?: string;
  taskTitle?: string;
}

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  provider: 'vercel',
  fromName: 'RAK 4 CREATIVE Traffic',
  fromEmail: 'onboarding@resend.dev',
  replyTo: 'farah.y@rak4creative.com',
  enableAssignmentEmails: true,
  enableDailyReminders: true
};

/**
 * Dispatch email through configured provider (Vercel / Resend, SendGrid, Brevo, Webhook, or Simulated)
 */
export async function sendEmail(
  payload: SendEmailPayload,
  config: EmailConfig = DEFAULT_EMAIL_CONFIG
): Promise<{ success: boolean; log: EmailLog; error?: string }> {
  const senderName = payload.from?.name || config.fromName || 'RAK 4 CREATIVE Traffic';
  let senderEmail = payload.from?.email || config.fromEmail || 'onboarding@resend.dev';

  const logId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const sentAt = new Date().toISOString();

  let deliveryStatus: EmailDeliveryStatus = 'simulated';
  let errorMessage: string | undefined;

  const activeProvider = config.provider || (process.env.EMAIL_PROVIDER as EmailProviderType) || 'vercel';
  const effectiveApiKey = config.apiKey || 
    (activeProvider === 'vercel' || activeProvider === 'resend' ? process.env.RESEND_API_KEY : '') ||
    (activeProvider === 'sendgrid' ? process.env.SENDGRID_API_KEY : '') ||
    (activeProvider === 'brevo' ? process.env.BREVO_API_KEY : '');
  const effectiveWebhookUrl = config.webhookUrl || process.env.EMAIL_WEBHOOK_URL;

  try {
    switch (activeProvider) {
      case 'vercel':
      case 'resend': {
        if (!effectiveApiKey) {
          // If no API key provided yet, fall back gracefully to simulation mode with clear instruction
          console.warn('[Vercel Email Dispatcher] RESEND_API_KEY not set yet. Running in Vercel preview/simulated mode. Add RESEND_API_KEY in Vercel dashboard or Settings for live delivery.');
          deliveryStatus = 'simulated';
          break;
        }

        // If using test onboarding address, format appropriately
        const fromAddress = senderEmail.includes('@') ? senderEmail : 'onboarding@resend.dev';

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            from: `${senderName} <${fromAddress}>`,
            to: [payload.to.email],
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            reply_to: config.replyTo || senderEmail
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const rawMsg = data.message || `Resend error: ${res.statusText}`;
          if (rawMsg.includes('only send testing emails') || rawMsg.includes('testing emails')) {
            throw new Error(`${rawMsg} (Tip: When using onboarding@resend.dev, Resend requires sending to the email you registered on Resend, or verify a custom domain in Resend to send to everyone).`);
          }
          throw new Error(rawMsg);
        }
        deliveryStatus = 'delivered';
        break;
      }

      case 'sendgrid': {
        if (!effectiveApiKey) {
          throw new Error('SendGrid API key is missing. Please set your API Key in Settings or SENDGRID_API_KEY in .env.');
        }

        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: payload.to.email, name: payload.to.name }] }],
            from: { email: senderEmail, name: senderName },
            reply_to: config.replyTo ? { email: config.replyTo } : undefined,
            subject: payload.subject,
            content: [
              { type: 'text/plain', value: payload.text },
              { type: 'text/html', value: payload.html }
            ]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.errors?.[0]?.message || `SendGrid error: ${res.statusText}`);
        }
        deliveryStatus = 'delivered';
        break;
      }

      case 'brevo': {
        if (!effectiveApiKey) {
          throw new Error('Brevo API key is missing. Please set your API Key in Settings or BREVO_API_KEY in .env.');
        }

        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': effectiveApiKey
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ name: payload.to.name, email: payload.to.email }],
            replyTo: config.replyTo ? { email: config.replyTo } : undefined,
            subject: payload.subject,
            htmlContent: payload.html,
            textContent: payload.text
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || `Brevo error: ${res.statusText}`);
        }
        deliveryStatus = 'delivered';
        break;
      }

      case 'webhook': {
        if (!effectiveWebhookUrl) {
          throw new Error('Custom Webhook URL is not configured in Settings or EMAIL_WEBHOOK_URL in .env.');
        }

        const res = await fetch(effectiveWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'traffic_email_dispatch',
            type: payload.type,
            recipient: payload.to,
            sender: { name: senderName, email: senderEmail },
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            taskId: payload.taskId,
            taskTitle: payload.taskTitle,
            timestamp: sentAt
          })
        });

        if (!res.ok) {
          throw new Error(`Webhook error: ${res.statusText}`);
        }
        deliveryStatus = 'delivered';
        break;
      }

      case 'simulated':
      default: {
        // Simulated / development mode: instant successful dispatch logged to in-app outbox
        console.log(`[SIMULATED EMAIL DISPATCH] To: ${payload.to.name} <${payload.to.email}> | Subject: "${payload.subject}" | Type: ${payload.type}`);
        deliveryStatus = 'simulated';
        break;
      }
    }
  } catch (err: any) {
    console.error('Email dispatch failed:', err);
    deliveryStatus = 'failed';
    errorMessage = err?.message || 'Failed to dispatch email';
  }

  const log: EmailLog = {
    id: logId,
    taskId: payload.taskId,
    taskTitle: payload.taskTitle,
    recipientId: payload.to.id || 'usr-custom',
    recipientName: payload.to.name,
    recipientEmail: payload.to.email,
    senderName,
    senderEmail,
    subject: payload.subject,
    type: payload.type,
    htmlBody: payload.html,
    textBody: payload.text,
    sentAt,
    status: deliveryStatus,
    provider: config.provider,
    errorMessage
  };

  return {
    success: deliveryStatus !== 'failed',
    log,
    error: errorMessage
  };
}

/**
 * High-level helper: Send Task Assigned Notification
 */
export async function sendTaskAssignedNotification(
  params: { task: Task; assignee: User; assigner?: User | null; client?: Client | null; baseUrl?: string },
  config?: EmailConfig
) {
  const { subject, html, text } = generateTaskAssignedEmail(params);
  return sendEmail(
    {
      to: { id: params.assignee.id, name: params.assignee.name, email: params.assignee.email },
      subject,
      html,
      text,
      type: 'assigned',
      taskId: params.task.id,
      taskTitle: params.task.title
    },
    config
  );
}

/**
 * High-level helper: Send Due Today Reminder
 */
export async function sendDueTodayNotification(
  params: { task: Task; assignee: User; assigner?: User | null; client?: Client | null; baseUrl?: string },
  config?: EmailConfig
) {
  const { subject, html, text } = generateDueTodayEmail(params);
  return sendEmail(
    {
      to: { id: params.assignee.id, name: params.assignee.name, email: params.assignee.email },
      subject,
      html,
      text,
      type: 'due_today',
      taskId: params.task.id,
      taskTitle: params.task.title
    },
    config
  );
}

/**
 * High-level helper: Send Daily Overdue Escalation Reminder (1 email per day until completed)
 */
export async function sendOverdueDailyNotification(
  params: { task: Task; assignee: User; assigner?: User | null; client?: Client | null; baseUrl?: string; daysOverdue: number },
  config?: EmailConfig
) {
  const { subject, html, text } = generateOverdueDailyEmail(params);
  return sendEmail(
    {
      to: { id: params.assignee.id, name: params.assignee.name, email: params.assignee.email },
      subject,
      html,
      text,
      type: 'overdue',
      taskId: params.task.id,
      taskTitle: params.task.title
    },
    config
  );
}

/**
 * High-level helper: Send Task Completed Notification
 */
export async function sendTaskCompletedNotification(
  params: { task: Task; assignee: User; assigner: User; client?: Client | null; baseUrl?: string },
  config?: EmailConfig
) {
  const { subject, html, text } = generateTaskCompletedEmail(params);
  return sendEmail(
    {
      to: { id: params.assigner.id, name: params.assigner.name, email: params.assigner.email },
      subject,
      html,
      text,
      type: 'completed',
      taskId: params.task.id,
      taskTitle: params.task.title
    },
    config
  );
}

/**
 * High-level helper: Send Test Notification
 */
export async function sendTestNotification(
  params: { recipientName: string; recipientEmail: string; baseUrl?: string },
  config?: EmailConfig
) {
  const { subject, html, text } = generateTestEmail(params);
  return sendEmail(
    {
      to: { name: params.recipientName, email: params.recipientEmail },
      subject,
      html,
      text,
      type: 'test'
    },
    config
  );
}
