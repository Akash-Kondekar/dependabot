import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";
import { plugin as mdPlugin } from "vite-plugin-markdown";
import svgr from "vite-plugin-svgr";
import ESLintPlugin from "vite-plugin-eslint2";

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current directory.
    import.meta.env = { ...import.meta.env, ...loadEnv(mode, process.cwd(), "VITE_") };

    return {
        base: "/",
        publicDir: "public",
        plugins: [
            react(),
            mdPlugin({
                markdownItOptions: {
                    html: true,
                    linkify: true,
                    typographer: true,
                },
                // Support for using markdown content both as HTML and as raw text
                mode: ["html", "raw"],
            }),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
                manifest: {
                    name: "Dexter",
                    short_name: "Dexter",
                    description: "Dexter - Your gateway to automated Clinical Epidemiology Studies",
                    theme_color: "#ffffff",
                    icons: [
                        {
                            src: "assets/img/Dexter-logo.png",
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: "assets/img/Dexter-logo.png",
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                },
                workbox: {
                    maximumFileSizeToCacheInBytes: 5 * 1024 ** 2, // 5 MB
                },
            }),
            svgr(),
            ESLintPlugin({
                dev: true,
                build: true,
                emitError: true,
                emitWarning: true,
                lintOnStart: true,
                lintInWorker: true,
                fix: true,
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        build: {
            outDir: "build",
            emptyOutDir: true, // also necessary
        },
        assetsInclude: ["**/*.md,**/*.svg"],
        server: {
            port: 3000,
            https:
                import.meta.env.VITE_SSL_KEY_FILE && import.meta.env.VITE_SSL_CRT_FILE
                    ? {
                          key: fs.readFileSync(import.meta.env.VITE_SSL_KEY_FILE),
                          cert: fs.readFileSync(import.meta.env.VITE_SSL_CRT_FILE),
                      }
                    : undefined,
        },
        test: { globals: true },
    };
});
