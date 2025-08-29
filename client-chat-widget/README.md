# Client Chat Widget

Widget de chat para incrustar soporte en aplicaciones externas.

## Instalación (local)

```bash
npm install
npm run dev
```

## Build de librería

```bash
npm run build
```
Genera `dist/` con formatos `ES` y `UMD` (`.umd.cjs`). Incluye declaraciones TypeScript.

Publicación (asegúrate de versionar `package.json`):
```bash
npm login
npm publish --access public
```
El script `prepare` corre el build automáticamente antes de publicar (npm >=7).

## Uso rápido

Archivo UMD (para incluir vía `<script>`): `dist/client-chat-widget.umd.cjs`

Ejemplo embebido sin bundler:

```html
<div id="client-chat-widget"></div>
<script>
	// Rutas a tus endpoints (antes de cargar el script de la librería)
	window.CHAT_API_BASE = 'https://mi-api.com/api';
	window.CHAT_SIGNALR_BASE = 'https://mi-api.com';
</script>
<script src="/ruta/a/client-chat-widget.umd.cjs"></script>
<script>
	// El bundle UMD expone global `ClientChatWidget`
	ClientChatWidget.mountClientChat({
		clientId: 'cliente-123',
		clientName: 'Juan',
		systemCode: 'geoportal'
	});
</script>
```

O en React / bundler:

```tsx
import { ClientChat } from 'client-chat-widget';

<ClientChat clientId="c1" systemCode="geoportal" clientName="Ana" />
```

Montaje programático (sin JSX):
```ts
import { mountClientChat } from 'client-chat-widget';
mountClientChat({ clientId: 'c1', systemCode: 'geoportal', clientName: 'Ana' });
```

## Configuración de endpoints

Puedes cambiar las URLs sin recompilar usando variables globales antes de montar:

```js
window.CHAT_API_BASE = 'https://prod.api.com/api';
window.CHAT_SIGNALR_BASE = 'https://prod.api.com';
```

También soporta variables de entorno Vite (`.env`):
```
VITE_CHAT_API_BASE=https://prod.api.com/api
VITE_CHAT_SIGNALR_BASE=https://prod.api.com
```

## Reiniciar chat tras cierre por soporte
Cuando soporte cierra la sesión el widget muestra un mensaje y bloquea envíos hasta que el usuario pulsa "Iniciar nuevo chat" (control provisto dentro del input cuando `isChatClosed`).

## Desarrollo
`src/App.tsx` sólo sirve como entorno de prueba local y no se exporta.

## Theming
Consulta `README-THEMING.md` para ver todos los design tokens (`tokens.css`) y cómo sobreescribirlos sin recompilar.

