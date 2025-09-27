export default {
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020'
  },
  server: {
    port: 3000,
    open: true
  },
  watch: {
    usePolling: true, // Utile su alcuni sistemi (es. Windows)
  },
};