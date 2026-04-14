import { defineConfig } from "vitest/config";

/**
 * DB integration tests (`RUN_INTEGRATION=1`). Use `npm run test:integration`.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["src/test-env.ts"],
  },
});
