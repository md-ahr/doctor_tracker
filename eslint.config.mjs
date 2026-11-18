import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    ".cursor/**",
    "test-results/**",
    "playwright-report/**",
    ".next-e2e/**",
  ]),
  {
    rules: {
      "no-console": "error",
    },
  },
]);

export default eslintConfig;
