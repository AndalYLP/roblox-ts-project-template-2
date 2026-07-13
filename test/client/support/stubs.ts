import type { Logger } from "@rbxts/log";

import { playersAtom } from "shared/store/atoms/player/atom";

const LEVELS = ["Info", "Warn", "Error", "Debug", "Fatal", "Verbose"] as const;

export interface StubLogger {
	/** How many times each log level was called. */
	readonly calls: Record<string, number>;
	/** A stub that satisfies the `Logger` type used by controllers. */
	readonly logger: Logger;
}

/** Builds a recording {@link Logger} stub for constructing controllers. */
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

/** A minimal `Player` stub — controllers only read `UserId`/`Name`. */
export function fakePlayer(userId: number, name = `Player${userId}`): Player {
	return { Name: name, UserId: userId } as unknown as Player;
}

/** Clears the player atoms so each test starts from an isolated store. */
export function resetPlayerAtoms(): void {
	playersAtom.datastore({});
	playersAtom.chatTag({});
}
