import type { PlayerSettingsData, ThemeName } from "shared/store/atoms/player/settings";

export type AudioSetting = keyof PlayerSettingsData["audio"];

export interface SettingsClientToServerEvents {
	/**
	 * Requests a change to one of the player's audio volume settings. The server
	 * validates and clamps the value before persisting it.
	 *
	 * @param setting - Which audio volume to change.
	 * @param value - The new volume, in the `0`–`1` range.
	 */
	setAudioVolume: (setting: AudioSetting, value: number) => void;
	/**
	 * Requests a change to the player's UI theme.
	 *
	 * @param theme - The theme to switch to.
	 */
	setTheme: (theme: ThemeName) => void;
}
