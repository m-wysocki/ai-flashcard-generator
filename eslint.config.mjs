// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import eslintConfigPrettier from "eslint-config-prettier";

import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  globalIgnores([".next/**", "node_modules/**", "coverage/**", "dist/**", "storybook-static/**"]),
  {
    rules: {
      "max-len": ["error", { code: 100, tabWidth: 2, ignoreUrls: true }],
    },
  },
  ...storybook.configs["flat/recommended"],
  eslintConfigPrettier
];

export default eslintConfig;
