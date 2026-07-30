import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";

import path from "path";
const resolvePath = (str) => path.resolve(__dirname, str);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,
    },
    preview: {
      open: true,
      host: true,
    },
    define: {
      global: "window",
    },
    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
        },
        less: {
          charset: false,
        },
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
    build: {
      // No chunkSizeWarningLimit override — warnings at the default 500 KB are intentional
      // so that oversized bundles are caught early. Fix them with lazy imports, not silence.
      rollupOptions: {
        input: {
          main: resolvePath("index.html"),
        },
        output: {
          // Manual code-splitting: heavy libraries get their own chunk so they are
          // only loaded when the route that needs them is visited.
          manualChunks: {
            // Charting libraries
            charts: ['apexcharts', 'react-apexcharts', 'chart.js', 'react-chartjs-2'],
            // Calendar
            calendar: ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
            // PDF generation
            pdf: ['jspdf', 'jspdf-autotable'],
            // Animation
            motion: ['framer-motion'],
            // Core React + routing
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()],
  };
});
