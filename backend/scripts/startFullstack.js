const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
const backendDir = path.resolve(__dirname, '..');

function spawnProcess(command, args, cwd, name) {
  console.log(`
Starting ${name}:
  cwd: ${cwd}
  command: ${command} ${args.join(' ')}
`);

  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code, signal) => {
    console.log(`${name} exited with code ${code} ${signal ? `(signal ${signal})` : ''}`);
  });

  child.on('error', (err) => {
    console.error(`${name} failed to start:`, err.message);
  });

  return child;
}

async function ensureFrontendInstalled() {
  const fs = require('fs');
  const nm = path.join(frontendDir, 'node_modules');
  if (!fs.existsSync(nm)) {
    console.warn('\nThe frontend dependencies are not installed. Installing now (this may take a minute)...\n');
    const installer = spawn('npm', ['install'], { cwd: frontendDir, shell: true, stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      installer.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error('npm install failed in frontend'));
      });
      installer.on('error', reject);
    });
  }
}

(async () => {
  try {
    await ensureFrontendInstalled();
  } catch (err) {
    console.error('Failed to install frontend dependencies:', err.message);
    console.error(`Please cd ${frontendDir} and run 'npm install' manually, then retry.`);
    process.exit(1);
  }

  const frontend = spawnProcess('npm', ['run', 'dev'], frontendDir, 'frontend');
  const backend = spawnProcess('npm', ['run', 'dev'], backendDir, 'backend');

  function shutdown(signal) {
    console.log(`\nReceived ${signal}, shutting down children...`);
    [frontend, backend].forEach((c) => {
      if (c && !c.killed) {
        try { c.kill('SIGINT'); } catch (e) {}
      }
    });
    // give children a moment to exit
    setTimeout(() => process.exit(0), 500);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => shutdown('exit'));
})();
