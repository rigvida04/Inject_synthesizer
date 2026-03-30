const localtunnel = require('localtunnel');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SUBDOMAIN = process.env.TUNNEL_SUBDOMAIN || 'inject-synthesizer';

// Start the Express server as a child process
const server = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Delay (ms) to allow the Express server to be ready before opening the tunnel
const SERVER_STARTUP_DELAY_MS = 1500;
setTimeout(async () => {
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

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
}, SERVER_STARTUP_DELAY_MS);

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
