import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierPlugin from "eslint-plugin-prettier";
import prettier from "eslint-config-prettier";

export default [
    reactHooks.configs.flat.recommended,
    { ignores: ["dist", "build", "node_modules", "coverage", ".github", "git_hooks"] },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            prettier: prettierPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "prettier/prettier": ["error"],
            "react/prop-types": "off",
            "no-console": ["warn", { allow: ["warn", "error"] }],
            eqeqeq: ["error", "always"],
            "react-hooks/exhaustive-deps": "off",
            "react-refresh/only-export-components": "off",
            "react-hooks/static-components": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/refs": "off",
            "react-hooks/immutability": "off",
        },
        settings: { react: { version: "detect" } },
    },
    prettier,
    { files: ["**/*.test.js", "**/__tests__/**/*.js"], rules: { "no-undef": "off" } },
];
