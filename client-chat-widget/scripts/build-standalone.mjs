// Build standalone bundle that incluye React y ReactDOM para uso <script src="..."> simple.
// Genera: dist/standalone/client-chat-widget.standalone.js
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('dist/standalone');
fs.mkdirSync(outDir, { recursive: true });

// Entry virtual: monta automáticamente el widget leyendo data-* attributes
const entryFile = path.resolve('src/standalone-entry.ts');

if (!fs.existsSync(entryFile)) {
  console.error('Missing standalone entry file src/standalone-entry.ts');
  process.exit(1);
}

build({
  entryPoints: [entryFile],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: path.join(outDir, 'client-chat-widget.standalone.js'),
  format: 'iife',
  globalName: 'ClientChatWidgetStandalone',
  target: 'es2018',
  loader: { '.ts': 'ts' },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  // Inline CSS para que solo se necesite 1 <script>
  const jsPath = path.join(outDir, 'client-chat-widget.standalone.js');
  const cssPath = path.join(outDir, 'client-chat-widget.standalone.css');
  if (fs.existsSync(cssPath) && fs.existsSync(jsPath)) {
    const css = fs.readFileSync(cssPath, 'utf8').replace(/`/g, '\\`');
    const inject = "(()=>{try{var s=document.createElement('style');s.dataset.source='client-chat-widget';s.textContent=`" + css + "`;document.head.appendChild(s);}catch(e){console.error('CSS inject fail',e);}})();";
    const original = fs.readFileSync(jsPath, 'utf8');
    fs.writeFileSync(jsPath, inject + '\n' + original, 'utf8');
    // Opcional: dejar el archivo CSS (útil para depuración); se podría borrar si se desea.
  }
  console.log('Standalone bundle listo (CSS inline): dist/standalone/client-chat-widget.standalone.js');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
