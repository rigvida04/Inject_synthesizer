const localtunnel = require('localtunnel');
const { spawn } = require('child_process');
const path = require('path');

// PORT must be a number for localtunnel; convert to string only when passed to child env
const PORT = Number(process.env.PORT) || 3000;
const SUBDOMAIN = process.env.TUNNEL_SUBDOMAIN || 'inject-synthesizer';

let tunnel = null;

// Start the Express server as a child process; 'ipc' channel lets it signal readiness
const server = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  env: { ...process.env, PORT: String(PORT) },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// If the server exits unexpectedly, close the tunnel and exit non-zero
server.on('exit', (code, signal) => {
  if (code !== 0 || signal) {
    console.error(`Server exited unexpectedly (code=${code}, signal=${signal})`);
    if (tunnel) tunnel.close();
    process.exit(code !== null ? code : 1);
  }
});

// Open the tunnel only after the server signals it is ready via IPC
server.once('message', async (msg) => {
  if (msg !== 'ready') return;
  try {
    tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

    console.log('');
    console.log('=================================================');
    console.log(`  Public URL: ${tunnel.url}`);
    console.log('  Share this URL to open the app on any device.');
    console.log('=================================================');
    console.log('');

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
      server.kill();
      process.exit(0);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
    });
  } catch (err) {
    console.error('Could not open tunnel:', err.message);
    server.kill();
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (tunnel) tunnel.close();
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (tunnel) tunnel.close();
  server.kill();
  process.exit(0);
});
