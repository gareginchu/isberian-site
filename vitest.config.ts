import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["evals/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname.replace(/^\//, ""),
    },
  },
});
