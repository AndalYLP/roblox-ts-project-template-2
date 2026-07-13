import { Janitor } from "@rbxts/janitor";
import type { Document } from "@rbxts/lapis";
import type { Logger } from "@rbxts/log";

import { PlayerEntity } from "server/services/player/entity";
import { type PlayerData, playersAtom } from "shared/store/atoms/player/atom";

const LEVELS = ["Info", "Warn", "Error", "Debug", "Fatal", "Verbose"] as const;

export interface StubLogger {
	/** How many times each log level was called. */
	readonly calls: Record<string, number>;
	/** A stub that satisfies the `Logger` type used by services. */
	readonly logger: Logger;
}

/**
 * Builds a recording {@link Logger} stub. Services take a `Logger` through their
 * constructor, so this lets us instantiate them without Flamework and assert on
 * whether they logged.
 */
export function makeLogger(): StubLogger {
	const calls: Record<string, number> = {};
	const target: Record<string, Callback> = {};

	for (const level of LEVELS) {
		calls[level] = 0;
		target[level] = (..._args: Array<unknown>) => {
			calls[level] += 1;
		};
	}

	return { calls, logger: target as unknown as Logger };
}

/** A minimal `Player` stub — services only read `Name` and `UserId`. */
export function fakePlayer(userId: number, name = `Player${userId}`): Player {
	return { Name: name, UserId: userId } as unknown as Player;
}

/** Clears the player atoms so each test starts from an isolated store. */
export function resetPlayerAtoms(): void {
	playersAtom.datastore({});
	playersAtom.chatTag({});
}

/** Builds a fresh {@link PlayerData} object, with optional slice overrides. */
export function makePlayerData(overrides?: Partial<PlayerData>): PlayerData {
	return {
		achievements: {
			badges: new Map(),
		},
		balance: {
			money: 0,
		},
		dailyReward: {
			lastClaimTime: 0,
			streak: 0,
		},
		mtx: {
			gamePasses: new Map(),
			products: new Map(),
			receiptHistory: [],
		},
		settings: {
			audio: {
				musicVolume: 1,
				sfxVolume: 1,
			},
		},
		...overrides,
	};
}

/**
 * Constructs a real {@link PlayerEntity} around stubbed collaborators. The
 * janitor is real (it is pure Luau) while the document is an inert stub, which
 * is enough for the service methods under test.
 */
export function makePlayerEntity(userId: number): PlayerEntity {
	return new PlayerEntity(
		fakePlayer(userId),
		new Janitor(),
		{} as unknown as Document<PlayerData>,
	);
}
