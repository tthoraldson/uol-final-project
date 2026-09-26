import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: [
      "node_modules/**",
      "src/**/*.browser.test.ts",
      "src/**/*.browser.test.tsx",
    ],
    pool: "forks",
  },
});
