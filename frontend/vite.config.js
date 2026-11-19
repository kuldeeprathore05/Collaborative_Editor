import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from "node:url";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "monaco-editor/esm/vs/editor/editor.api.js":
        fileURLToPath(
          new URL(
            "./node_modules/monaco-editor/esm/vs/editor/editor.api.js",
            import.meta.url
          )
        ),
    }, 
  },
})