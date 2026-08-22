# RAK Traffic

RAK Traffic is a Next.js 16 application. It must run as a **Node.js application** on cPanel; it cannot be uploaded as static files because the email features use server API routes.

## Requirements

- A cPanel plan with **Setup Node.js App** or **Application Manager**
- Node.js 20.9 or newer
- Git Version Control access to this GitHub repository
- A domain or subdomain pointed at the Node.js application

## Deploy from GitHub with cPanel Git Version Control

1. In **Git Version Control**, clone this repository into a path outside `public_html`, for example `/home/CPANEL_USER/apps/rak-traffic`.
2. In **Setup Node.js App** or **Application Manager**, create an application with:
   - Node.js version: the newest available `20.x` or later (minimum `20.9`)
   - Mode: `Production`
   - Application root: the Git checkout path
   - Application URL: preferably a dedicated domain or subdomain
   - Startup file: `app.js` (the default Passenger filename)
3. Add the environment variables described below in the Node.js application settings.
4. In **Git Version Control**, select **Update from Remote**, then **Deploy HEAD Commit**. The included `.cpanel.yml` runs a clean install, production build, dependency prune, and Passenger restart.
5. Confirm the deployment at `https://YOUR_DOMAIN/api/health`. A healthy server returns JSON with `"status":"ok"`.

If the cPanel Git deploy screen cannot find `node` or `npm`, activate the Node.js application environment in cPanel's Terminal and run:

```bash
cd /home/CPANEL_USER/apps/rak-traffic
npm ci --include=dev
npm run build
npm prune --omit=dev
mkdir -p tmp && touch tmp/restart.txt
```

Do not upload `.next` or `node_modules` from a local computer. They are generated on the Linux server by the deployment task.

## Environment variables

Copy the relevant values from `.env.example` into cPanel's Node.js application environment. Do not commit real credentials to Git.

At minimum, set:

```text
NODE_ENV=production
APP_URL=https://traffic.example.com
EMAIL_PROVIDER=simulated
CRON_SECRET=a-long-random-secret
```

For live email, change `EMAIL_PROVIDER` to `resend`, `sendgrid`, `brevo`, or `webhook`, then set the matching API key and verified sender variables:

```text
EMAIL_FROM_NAME=RAK 4 CREATIVE Traffic Operations
EMAIL_FROM=traffic@example.com
EMAIL_REPLY_TO=traffic@example.com
RESEND_API_KEY=...
EMAIL_ALLOWED_DOMAINS=rak4creative.com
```

Server environment values take precedence over browser settings.

## Daily reminder cron

The Vercel scheduler is not available on cPanel. In **Cron Jobs**, add this command and use the same secret configured as `CRON_SECRET`:

```bash
curl --fail --silent --show-error \
  -H 'Authorization: Bearer YOUR_CRON_SECRET' \
  https://YOUR_DOMAIN/api/email/daily-cron >/dev/null
```

Use the schedule `0 6 * * *` for 06:00 in the server's timezone. The endpoint returns `401` for a wrong secret and `503` in production when `CRON_SECRET` is missing.

## Local verification

```bash
npm ci
npm run build
npm start
```

Then open `http://localhost:3000` or check `http://localhost:3000/api/health`.

## Current data model limitation

Tasks, users, settings, and logs are currently stored in each browser's `localStorage`. This means the deployed UI will run, but different browsers/users do **not** share live data, and the server cron scans the bundled starter data rather than browser-created tasks. A database and authentication layer are required before treating this as a shared multi-user production system.
