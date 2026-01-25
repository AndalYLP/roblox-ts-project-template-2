import eslint from "@eslint/js";

import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import roblox from "eslint-plugin-roblox-ts";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	roblox.configs.tsRecommendedCompat,
	roblox.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.build.json",
				projectService: false,
				sourceType: "module",
			},
		},
		rules: {
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{
					fixStyle: "separate-type-imports",
					prefer: "type-imports",
				},
			],
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],
			"@typescript-eslint/no-floating-promises": "error",
			"no-void": ["off"],
		},
	},
	{
		plugins: {
			perfectionist,
		},
		rules: {
			"perfectionist/sort-imports": [
				"error",
				{
					customGroups: [
						{
							elementNamePattern: "^react$",
							groupName: "react",
						},
						{
							elementNamePattern: "^@",
							groupName: "type-scoped",
							selector: "type",
						},
						{
							elementNamePattern: "^@",
							groupName: "value-scoped",
						},
					],
					groups: [
						"react",
						"value-scoped",
						{ newlinesBetween: 0 },
						"type-scoped",
						["value-builtin", "value-external"],
						{ newlinesBetween: 0 },
						["type-builtin", "type-external"],
						["value-parent", "value-sibling", "value-index"],
						{ newlinesBetween: 0 },
						[
							"type-internal",
							"value-internal",
							"type-parent",
							"type-sibling",
							"type-index",
						],
						"unknown",
					],
				},
			],
		},
	},
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		rules: {
			"prettier/prettier": [
				"error",
				{
					arrowParens: "always",
					bracketSpacing: true,
					printWidth: 100,
					semi: true,
					singleQuote: false,
					tabWidth: 4,
					trailingComma: "all",
					useTabs: true,
				},
			],
		},
	},

	{
		plugins: {
			"unused-imports": unusedImports,
		},
		rules: {
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
		},
	},
	prettierRecommended,
);
