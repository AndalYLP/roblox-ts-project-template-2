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

// Neutral, Roblox-native palette: desaturated grey surfaces (matching the
// in-experience topbar/menus) with Roblox's signature blue as the only accent.
// Kept deliberately plain so the template reads as stock Roblox UI.
export const THEMES: Record<ThemeName, Palette> = {
	dark: {
		accent: Color3.fromRGB(0, 162, 255),
		accentLight: Color3.fromRGB(87, 194, 255),
		background: Color3.fromRGB(18, 19, 21),
		foreground: Color3.fromRGB(255, 255, 255),
		surface: Color3.fromRGB(32, 34, 37),
		surfaceLight: Color3.fromRGB(48, 50, 54),
	},
	light: {
		accent: Color3.fromRGB(0, 162, 255),
		accentLight: Color3.fromRGB(87, 194, 255),
		background: Color3.fromRGB(242, 243, 245),
		foreground: Color3.fromRGB(25, 27, 29),
		surface: Color3.fromRGB(255, 255, 255),
		surfaceLight: Color3.fromRGB(226, 228, 232),
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
