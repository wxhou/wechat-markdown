import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 专用固定端口：tauri.conf.json 的 devUrl 绑定此端口。
    // strictPort 让端口冲突直接失败，而不是静默顺延后让 Tauri 窗口
    // 加载到占用该端口的其它应用。
    port: 5188,
    host: '127.0.0.1',
    strictPort: true,
  },
  preview: {
    port: 4173,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
});
