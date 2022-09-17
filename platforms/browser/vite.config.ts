import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';
import Pages from 'vite-plugin-pages';
import { resolve } from 'path';
import graphqlTag from 'babel-plugin-graphql-tag';

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
