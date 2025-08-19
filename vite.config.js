import { defineConfig } from 'vite'; //for autocomplete
import react from '@vitejs/plugin-react'; //vite plugin for react

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //server configuration
  server: {
    port: 3000, //local development server
    //all the api requests from port 3000 go through the vite dev server then to backend(8000) to avoid CORS
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
