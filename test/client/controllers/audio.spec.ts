import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { AudioController, SoundType } from "client/controllers/audio";
import type { PlayerSettingsData } from "shared/store/atoms/player/settings";

import { makeLogger } from "../support/stubs";

interface AudioInternals {
	makeSoundGroup(soundType: SoundType): SoundGroup;
	onSettingsChanged(current: PlayerSettingsData): void;
	soundGroups: Map<SoundType, SoundGroup>;
}

describe("AudioController", () => {
	let controller: AudioController;
	let internals: AudioInternals;

	beforeEach(() => {
		controller = new AudioController(makeLogger().logger);
		internals = controller as unknown as AudioInternals;
		controller.onInit();
	});

	it("creates a sound group per sound type on init", () => {
		expect(internals.soundGroups.get(SoundType.Music)).toBeDefined();
		expect(internals.soundGroups.get(SoundType.SoundEffect)).toBeDefined();
	});

	it("reuses the existing sound group instead of creating a duplicate", () => {
		expect(internals.makeSoundGroup(SoundType.Music)).toBe(
			internals.soundGroups.get(SoundType.Music),
		);
	});

	it("builds a sound routed to its group", () => {
		const sound = controller.createSound({
			sound: 123,
			soundType: SoundType.SoundEffect,
		});
		// Detach immediately: a bare numeric id resolves to a missing asset, and a
		// parented Sound would emit a load error that fails the headless runner.
		sound.Parent = undefined;

		expect(sound.SoundId).toBe("rbxassetid://123");
		expect(sound.SoundGroup).toBe(internals.soundGroups.get(SoundType.SoundEffect));
	});

	it("applies volume settings to the matching groups", () => {
		internals.onSettingsChanged({ audio: { musicVolume: 0.3, sfxVolume: 0.7 } });

		// `SoundGroup.Volume` is a 32-bit float, so it reads back slightly off from
		// the double literals — compare with tolerance rather than exact equality.
		expect(internals.soundGroups.get(SoundType.Music)?.Volume).toBeCloseTo(0.3);
		expect(internals.soundGroups.get(SoundType.SoundEffect)?.Volume).toBeCloseTo(0.7);
	});
});
