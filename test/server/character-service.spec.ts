import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { CharacterService } from "server/services/player/character";
import type { CharacterRig } from "utils/player";

import { fakePlayer, makeLogger, type StubLogger } from "./support/service-stubs";

interface CharacterServiceInternals {
	characterRigs: Map<Player, CharacterRig>;
}

/** A rig stub — the wrapper methods only pass it through, never touch it. */
function fakeRig(): CharacterRig {
	return {} as unknown as CharacterRig;
}

describe("CharacterService", () => {
	let logger: StubLogger;
	let service: CharacterService;
	let internals: CharacterServiceInternals;

	beforeEach(() => {
		logger = makeLogger();
		service = new CharacterService(logger.logger);
		internals = service as unknown as CharacterServiceInternals;
	});

	it("returns the rig for a player that has one", () => {
		const player = fakePlayer(1);
		const rig = fakeRig();
		internals.characterRigs.set(player, rig);

		expect(service.getCharacterRig(player)).toBe(rig);
	});

	it("returns undefined for a player with no rig", () => {
		expect(service.getCharacterRig(fakePlayer(2))).toBeUndefined();
	});

	describe("withPlayerRig", () => {
		it("swaps the player argument for its rig and forwards extra args", () => {
			const player = fakePlayer(1);
			const rig = fakeRig();
			internals.characterRigs.set(player, rig);

			let received: CharacterRig | undefined;
			const wrapped = service.withPlayerRig((playerRig, multiplier: number) => {
				received = playerRig;
				return multiplier * 2;
			});

			expect(wrapped(player, 5)).toBe(10);
			expect(received).toBe(rig);
		});

		it("returns undefined and logs when the player has no rig", () => {
			let called = false;
			const wrapped = service.withPlayerRig(() => {
				called = true;
			});

			expect(wrapped(fakePlayer(3))).toBeUndefined();
			expect(called).toBe(false);
			expect(logger.calls.Info).toBe(1);
		});
	});
});
