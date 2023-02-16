import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';
import Pages from 'vite-plugin-pages';
import { resolve } from 'path';
import graphqlTag from 'babel-plugin-graphql-tag';
import { VitePWA } from 'vite-plugin-pwa';

const isDevelopment = process.env.NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // devOptions: {
      //   enabled: true,
      // },
      manifest: {
        name: '记账平台',
        short_name: '记账平台',
        description: '多人多账本记账平台',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
    react({
      babel: {
        plugins: [
          isDevelopment && jotaiDebugLabel,
          isDevelopment && jotaiReactRefresh,
          !isDevelopment && graphqlTag,
        ].filter(Boolean),
      },
    }),
    Pages({
      exclude: ['**/commons/**'],
      routeStyle: 'nuxt',
      importMode: 'async',
    }),
  ],
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
