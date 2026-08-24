const { createServer } = require('node:http');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const rawPort = process.env.PORT;
const isNumericPort = rawPort && !Number.isNaN(Number(rawPort));
const port = isNumericPort ? Number(rawPort) : 3000;
const hostname = process.env.APP_HOST || '0.0.0.0';

const app = next({
  dev,
  ...(isNumericPort ? { hostname, port } : {}),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((request, response) => handle(request, response));

    const listenTarget = rawPort || port;
    server.listen(listenTarget, () => {
      console.log(`RAK Traffic is listening on ${listenTarget}`);
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
