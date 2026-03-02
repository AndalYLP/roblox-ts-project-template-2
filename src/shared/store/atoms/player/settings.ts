import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";

export interface PlayerSettingsData {
	readonly audio: {
		musicVolume: number;
		sfxVolume: number;
	};
}

/**
 * Updates a specific player's settings by modifying the given setting type.
 *
 * @param state - The current state.
 * @param settingCategory - The setting category from the setting type.
 * @param settingType - The setting type to change.
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
	updatePlayerData(userId, (data) => {
		const { settings } = data;

		return {
			...data,
			settings: {
				...settings,
				[settingCategory]: {
					[settingType]: value,
				},
			},
		};
	});
}

export function getAllPlayerSettings(userId: string): PlayerSettingsData | undefined {
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
	return getAllPlayerSettings(userId)?.[settingCategory][settingType];
}
