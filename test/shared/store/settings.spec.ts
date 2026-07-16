import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { setPlayerData } from "shared/store/atoms/player/atom";
import { changeSetting, getPlayerSetting } from "shared/store/atoms/player/settings";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

const USER = "1";

describe("settings atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
		setPlayerData(
			USER,
			makePlayerData({
				settings: {
					audio: { musicVolume: 1, sfxVolume: 1 },
					display: { theme: "dark" },
				},
			}),
		);
	});

	it("updates the targeted setting", () => {
		changeSetting(USER, "audio", "musicVolume", 0.5);

		expect(getPlayerSetting(USER, "audio", "musicVolume")).toBe(0.5);
	});

	// Regression: changing one setting used to wipe its siblings in the same
	// category, leaving them undefined.
	it("preserves sibling settings in the same category", () => {
		changeSetting(USER, "audio", "musicVolume", 0);

		expect(getPlayerSetting(USER, "audio", "musicVolume")).toBe(0);
		expect(getPlayerSetting(USER, "audio", "sfxVolume")).toBe(1);
	});

	it("reads back the latest of several updates", () => {
		changeSetting(USER, "audio", "sfxVolume", 0.2);
		changeSetting(USER, "audio", "sfxVolume", 0.8);

		expect(getPlayerSetting(USER, "audio", "sfxVolume")).toBe(0.8);
	});

	it("returns undefined for a user with no loaded data", () => {
		resetPlayerAtoms();

		expect(getPlayerSetting(USER, "audio", "musicVolume")).toBeUndefined();
	});
});
