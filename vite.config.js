import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rohithilluri.github.io/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.ktx2', '**/*.hdr'],
});
