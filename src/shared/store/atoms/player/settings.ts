import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";

export interface PlayerSettings {
	readonly audio: {
		musicVolume: number;
		sfxVolume: number;
	}
}

/**
 * Updates a specific player's settings by modifying the given setting type.
 *
 * @param state - The current state.
 * @param settingCategory - The setting category from the setting type.
 * @param settingType - The setting type to change.
 * @param value - The new value.
 */
export function changeSetting<Category extends keyof PlayerSettings, SettingType extends keyof PlayerSettings[Category]>(
	id: string,
	settingCategory: Category,
	settingType: SettingType,
	value: PlayerSettings[Category][SettingType]
) {
	updatePlayerData(id, (data) => {
		const { playerSettings } = data
		
		return {
			...data,
			playerSettings: {
				...playerSettings,
				[settingCategory]: {
					[settingType]: value
				}
			}
		}
	})
}

export function getAllPlayerSettings(id: string) {
	return getPlayerData(id)?.playerSettings
}

export function getPlayerSetting<Category extends keyof PlayerSettings, SettingType extends keyof PlayerSettings[Category]>(
	id: string,
	settingCategory: Category,
	settingType: SettingType,
) {
	return getAllPlayerSettings(id)?.[settingCategory][settingType]
}