import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  optimizeDeps: {
    noDiscovery: true
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
