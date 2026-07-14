import { subscribe } from "@rbxts/charm";
import { source } from "@rbxts/vide";

import { USER_ID } from "shared/constants/player";
import { getPlayerSetting, type ThemeName } from "shared/store/atoms/player/settings";

export interface Palette {
	accent: Color3;
	accentLight: Color3;
	background: Color3;
	foreground: Color3;
	surface: Color3;
	surfaceLight: Color3;
}

/** Used until the player's persisted theme has replicated. */
const DEFAULT_THEME: ThemeName = "dark";

export const THEMES: Record<ThemeName, Palette> = {
	dark: {
		accent: Color3.fromRGB(90, 130, 245),
		accentLight: Color3.fromRGB(160, 195, 255),
		background: Color3.fromRGB(15, 15, 20),
		foreground: Color3.fromRGB(235, 235, 235),
		surface: Color3.fromRGB(28, 28, 36),
		surfaceLight: Color3.fromRGB(48, 48, 60),
	},
	light: {
		accent: Color3.fromRGB(60, 110, 235),
		accentLight: Color3.fromRGB(120, 160, 250),
		background: Color3.fromRGB(238, 239, 244),
		foreground: Color3.fromRGB(28, 28, 36),
		surface: Color3.fromRGB(255, 255, 255),
		surfaceLight: Color3.fromRGB(228, 230, 238),
	},
};

// The theme is a server-authoritative, persisted setting synced through the
// store — mirror it into a source so the UI can bind to it reactively.
const currentTheme = source<ThemeName>(
	getPlayerSetting(USER_ID, "display", "theme") ?? DEFAULT_THEME,
);
subscribe(
	() => getPlayerSetting(USER_ID, "display", "theme"),
	(theme) => {
		currentTheme(theme ?? DEFAULT_THEME);
	},
);

/** The player's currently selected theme. */
export function themeName(): ThemeName {
	return currentTheme();
}

/** Reactive accessor for the current theme's palette. Bind with `() => palette().x`. */
export function palette(): Palette {
	return THEMES[currentTheme()];
}
