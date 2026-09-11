import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// 画像などの固定ファイルの置き場所。
// 新しい配置（./public）があればそれを使い、無ければ旧配置を使う。
const publicDir = fs.existsSync(path.resolve(__dirname, "public"))
  ? path.resolve(__dirname, "public")
  : path.resolve(__dirname, "packages/web/public");

export default defineConfig({
  publicDir,
  // 相対パスで書き出すので、GitHub Pages でも独自ドメインでもそのまま動く
  base: "./",
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
  server: { port: 4200, host: true },
});
