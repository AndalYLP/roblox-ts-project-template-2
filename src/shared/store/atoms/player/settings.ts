import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";

export interface PlayerSettings {
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
	Category extends keyof PlayerSettings,
	SettingType extends keyof PlayerSettings[Category],
>(
	userId: string,
	settingCategory: Category,
	settingType: SettingType,
	value: PlayerSettings[Category][SettingType],
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

export function getAllPlayerSettings(userId: string): PlayerSettings | undefined {
	return getPlayerData(userId)?.settings;
}

export function getPlayerSetting<
	Category extends keyof PlayerSettings,
	SettingType extends keyof PlayerSettings[Category],
>(
	userId: string,
	settingCategory: Category,
	settingType: SettingType,
): PlayerSettings[Category][SettingType] | undefined {
	return getAllPlayerSettings(userId)?.[settingCategory][settingType];
}
