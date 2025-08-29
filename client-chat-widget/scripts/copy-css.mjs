import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const styles = [
  { src: '../src/styles/ClientChat.css', dest: '../dist/styles/ClientChat.css' },
  { src: '../src/styles/tokens.css', dest: '../dist/styles/tokens.css' }
];

for (const f of styles) {
  const from = join(__dirname, f.src);
  const to = join(__dirname, f.dest);
  try {
    if (!existsSync(from)) continue;
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    console.log(`✅ Copiado ${from} -> ${to}`);
  } catch (e) {
    console.error('❌ Error copiando estilos', f, e);
    process.exitCode = 1;
  }
}
