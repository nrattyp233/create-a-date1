import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
  },
  resolve: {
    alias: {
      '@': new URL('.', import.meta.url).pathname
    }
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
