import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { throttleMiddleware } from "server/network/middleware/throttle";

/** Casts a plain table into a Player stub — the middleware only uses it as a key. */
function fakePlayer(userId: number): Player {
	return { UserId: userId } as unknown as Player;
}

const PLAYER_A = fakePlayer(1);
const PLAYER_B = fakePlayer(2);

describe("throttleMiddleware", () => {
	let received: Array<Player>;
	let throttled: (player: Player | undefined, ...args: Array<unknown>) => void;

	beforeEach(() => {
		received = [];
		// A large window so the throttle never resets during a synchronous test.
		// The second `event` argument is unused by the throttle, so a stub is fine.
		throttled = throttleMiddleware(60)(async (player, ..._args) => {
			received.push(player as Player);
		}, undefined as never);
	});

	it("passes the first call through to the next handler", () => {
		throttled(PLAYER_A);

		expect(received.size()).toBe(1);
		expect(received[0]).toBe(PLAYER_A);
	});

	it("blocks a second call from the same player within the window", () => {
		throttled(PLAYER_A);
		throttled(PLAYER_A);
		throttled(PLAYER_A);

		expect(received.size()).toBe(1);
	});

	it("throttles each player independently", () => {
		throttled(PLAYER_A);
		throttled(PLAYER_B);

		expect(received.size()).toBe(2);
		expect(received).toEqual([PLAYER_A, PLAYER_B]);
	});

	it("drops calls with no player without invoking the handler", () => {
		throttled(undefined);

		expect(received.size()).toBe(0);
	});
});
