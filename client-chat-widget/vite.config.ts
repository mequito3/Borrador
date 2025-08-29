import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      'client-chat-widget': path.resolve(__dirname, 'dist')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ClientChatWidget',
      fileName: 'client-chat-widget',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@microsoft/signalr'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@microsoft/signalr': 'signalR'
        }
      }
    }
  }
});
