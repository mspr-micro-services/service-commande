import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: true,
        process: true,
        __dirname: true,
        __filename: true,
        Buffer: true,
        setTimeout: true,
        setInterval: true,
        clearTimeout: true,
        clearInterval: true,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "import/no-unresolved": "error",
      "import/order": ["warn", { alphabetize: { order: "asc" } }],
    },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
        console: true,
        process: true,
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
];
