## Panel de Agentes – Chat Platform

Aplicación React (Vite) para operadores/agentes que gestionan sesiones de chat en tiempo real vía SignalR.

### Requerimientos
- Node 18+
- Backend .NET desplegado (endpoints REST + /hubs/chat)

### Configuración
Copiar `.env.example` a `.env` y ajustar:

```
VITE_API_BASE=https://tu-backend.com/api
VITE_SIGNALR_BASE=https://tu-backend.com
```

En desarrollo puedes apuntar a localhost. El widget y este panel usan la misma convención.

### Scripts
- `npm run dev` desarrollo con HMR
- `npm run build` build producción (sourcemaps + split vendor)
- `npm run preview` servir build local
- `npm test` tests (Jest + React Testing Library)

### Variables disponibles en runtime
Se inyecta `__APP_VERSION__` (package.json) y se expone en `config.ts` junto con `API_BASE`, `SIGNALR_BASE` y `FILE_BASE`.

### Arquitectura
- `src/config.ts` centraliza endpoints.
- Servicios de autenticación y SignalR usan helpers (`withApi`).
- División de código: vendor separado para caché eficiente.

### Deploy (ejemplo Railway / Render / Azure Static Web Apps)
1. Definir variables de entorno de build: `VITE_API_BASE`, `VITE_SIGNALR_BASE`.
2. Ejecutar `npm ci && npm run build`.
3. Servir `dist/` con un server estático. Asegura rewrites a `index.html` (SPA) para rutas internas (`/dashboard`).

### Seguridad / Mejores Prácticas
- JWT almacenado en localStorage (considerar rotación y expiración). Si se requiere mayor seguridad usar cookies HttpOnly en backend.
- CORS configurado en backend para origen del panel.
- Limitar tamaño de uploads (en backend). Panel valida placeholders de archivos para evitar duplicados.

### Próximos pasos sugeridos
- Añadir manejo de expiración de token (auto-logout).
- Indicador de escritura (typing) vía método SignalR adicional.
- Test unitarios para reducers de estado de chat.
- Lazy loading de paneles no críticos.

### Licencia
Interno / Propietario.
