import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: ".",

    build: {
        outDir: "./dist",
    },

    server: {
        port: 3000,
        open: true,
    },

    plugins: [],

    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@styles": resolve(__dirname, "src/styles"),
        },
    },
    base: "./",
});
