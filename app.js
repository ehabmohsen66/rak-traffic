const { createServer } = require('node:http');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const next = require('next');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.APP_HOST || '0.0.0.0';
const app = next({
  dev: process.env.NODE_ENV !== 'production',
  hostname,
  port,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((request, response) => handle(request, response));

    server.listen(port, hostname, () => {
      console.log(`RAK Traffic is listening on http://${hostname}:${port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received; closing the HTTP server.`);
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((error) => {
    console.error('Unable to start RAK Traffic:', error);
    process.exit(1);
  });
