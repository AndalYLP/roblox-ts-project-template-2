import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { PlayerService } from "server/services/player";
import type { PlayerDataService } from "server/services/player/data";
import type { PlayerEntity } from "server/services/player/entity";
import type { PlayerRemovalService } from "server/services/player/removal";

import { fakePlayer, makeLogger, makePlayerEntity, type StubLogger } from "./support/service-stubs";

/** Access shape for the private members the tests need to seed. */
interface PlayerServiceInternals {
	playerEntities: Map<Player, PlayerEntity>;
}

describe("PlayerService", () => {
	let logger: StubLogger;
	let service: PlayerService;
	let internals: PlayerServiceInternals;

	beforeEach(() => {
		logger = makeLogger();
		service = new PlayerService(
			logger.logger,
			{} as unknown as PlayerDataService,
			{} as unknown as PlayerRemovalService,
		);
		internals = service as unknown as PlayerServiceInternals;
	});

	it("returns the entity for a tracked player", () => {
		const player = fakePlayer(1);
		const entity = makePlayerEntity(1);
		internals.playerEntities.set(player, entity);

		expect(service.getPlayerEntity(player)).toBe(entity);
	});

	it("returns undefined for an untracked player", () => {
		expect(service.getPlayerEntity(fakePlayer(99))).toBeUndefined();
	});

	it("lists every tracked entity", () => {
		const first = makePlayerEntity(1);
		const second = makePlayerEntity(2);
		internals.playerEntities.set(fakePlayer(1), first);
		internals.playerEntities.set(fakePlayer(2), second);

		const all = service.getPlayerEntities();

		expect(all.size()).toBe(2);
		expect(all.includes(first)).toBe(true);
		expect(all.includes(second)).toBe(true);
	});

	describe("withPlayerEntity", () => {
		it("swaps the player argument for its entity and forwards extra args", () => {
			const player = fakePlayer(1);
			const entity = makePlayerEntity(1);
			internals.playerEntities.set(player, entity);

			let received: PlayerEntity | undefined;
			const wrapped = service.withPlayerEntity((playerEntity, a: number, b: number) => {
				received = playerEntity;
				return a + b;
			});

			expect(wrapped(player, 2, 3)).toBe(5);
			expect(received).toBe(entity);
		});

		it("returns undefined and logs an error when the player is untracked", () => {
			let called = false;
			const wrapped = service.withPlayerEntity(() => {
				called = true;
			});

			expect(wrapped(fakePlayer(7))).toBeUndefined();
			expect(called).toBe(false);
			expect(logger.calls.Error).toBe(1);
		});
	});
});
