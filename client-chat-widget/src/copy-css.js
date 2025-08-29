// copy-css.js
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "src/styles/ClientChat.css");
const dest = path.join(__dirname, "dist/styles/ClientChat.css");

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(source, dest);

console.log("✅ Estilos copiados a dist/styles/ClientChat.css");
