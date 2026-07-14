import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";

export const THEME_NAMES = ["dark", "light"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export interface PlayerSettingsData {
	readonly audio: {
		musicVolume: number;
		sfxVolume: number;
	};
	readonly display: {
		theme: ThemeName;
	};
}

/**
 * Updates a specific player's settings by modifying the given setting type.
 *
 * @param userId - The player to update.
 * @param settingCategory - The setting category (e.g. `audio`, `display`).
 * @param settingType - The setting within that category.
 * @param value - The new value.
 */
export function changeSetting<
	Category extends keyof PlayerSettingsData,
	SettingType extends keyof PlayerSettingsData[Category],
>(
	userId: string,
	settingCategory: Category,
	settingType: SettingType,
	value: PlayerSettingsData[Category][SettingType],
): void {
	updatePlayerData(userId, (state) => {
		const { settings } = state;

		return {
			...state,
			settings: {
				...settings,
				[settingCategory]: {
					...settings[settingCategory],
					[settingType]: value,
				},
			},
		};
	});
}

export function getAllPlayerSettingsData(userId: string): PlayerSettingsData | undefined {
	return getPlayerData(userId)?.settings;
}

export function getPlayerSetting<
	Category extends keyof PlayerSettingsData,
	SettingType extends keyof PlayerSettingsData[Category],
>(
	userId: string,
	settingCategory: Category,
	settingType: SettingType,
): PlayerSettingsData[Category][SettingType] | undefined {
	return getAllPlayerSettingsData(userId)?.[settingCategory][settingType];
}
