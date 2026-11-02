import { spawn } from 'node:child_process';
import { prepararDemo } from '../functions/scripts/seed-local.js';

await prepararDemo();
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], {
  stdio: 'inherit', env: { ...process.env, VITE_FIREBASE_EMULATORS: 'true' },
});
vite.on('exit', codigo => process.exit(codigo || 0));
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => { vite.kill(); process.exit(0); });
