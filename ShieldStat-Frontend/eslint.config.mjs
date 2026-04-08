import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This repo currently uses flexible JSON-ish shapes from APIs.
      // Enforcing strict typing everywhere is a follow-up refactor.
      "@typescript-eslint/no-explicit-any": "off",

      // Several pages intentionally hydrate client state from localStorage.
      // We'll keep this pattern for now.
      "react-hooks/set-state-in-effect": "off",

      // Tooling/Charts code defines small components inline (e.g. Recharts tooltip).
      "react-hooks/static-components": "off",

      // Keep JSX text ergonomic; escape entities later if needed.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
