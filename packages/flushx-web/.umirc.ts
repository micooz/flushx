import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  proxy: {
    '/api': {
      'target': 'http://localhost:3030',
      'changeOrigin': true,
    },
  },
});
