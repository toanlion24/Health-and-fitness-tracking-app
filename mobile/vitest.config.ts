import { defineConfig } from "vitest/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // Only transform source files, not node_modules
  transform: {
    "src/**/*.+(ts|tsx|js|jsx)": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    ],
  },
});
