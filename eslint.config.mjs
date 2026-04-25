import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports"; // 1. Import the plugin

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 2. Register the plugin object
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // 3. Turn off standard rules so they don't conflict
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      
      // 4. Enable the auto-fixable rule
      "unused-imports/no-unused-imports": "error",
      
      // 5. (Optional) Warn about unused variables that aren't imports
      "unused-imports/no-unused-vars": [
        "warn",
        { 
          "vars": "all", 
          "varsIgnorePattern": "^_", 
          "args": "after-used", 
          "argsIgnorePattern": "^_" 
        }
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;