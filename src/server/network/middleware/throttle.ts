import { Networking } from "@flamework/networking";
import { setTimeout } from "@rbxts/set-timeout";

/**
 * Creates a middleware that throttles the event for each player.
 *
 * See [David Corbacho's
 * article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `throttle` and `debounce`.
 *
 * @template I - Input type from the remote event (ignored).
 * @param time - The event to throttle.
 * @returns The network event middleware.
 */
export function throttleMiddleware<I extends Array<unknown>>(
	time: number,
): Networking.EventMiddleware<I> {
	const throttle = new Set<Player>();

	return (processNext) => {
		return (player, ...args) => {
			if (!player) {
				return;
			}

			if (throttle.has(player)) {
				return;
			}

			throttle.add(player);
			setTimeout(() => {
				throttle.delete(player);
			}, time);

			void processNext(player, ...args);
		};
	};
}

/**
 * Creates a middleware that throttles the remote function for each player.
 *
 * See [David Corbacho's
 * article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `throttle` and `debounce`.
 *
 * @template I - Input type from the remote function (ignored).
 * @template O - Result type from the remote function (ignored).
 * @param time - The function to throttle.
 * @returns The network function middleware.
 */
export function functionThrottleMiddleware<I extends Array<unknown>, O>(
	time: number,
): Networking.FunctionMiddleware<I, O> {
	const throttle = new Set<Player>();

	return (processNext) => {
		return async (player, ...args) => {
			if (!player) {
				return Networking.Skip;
			}

			if (throttle.has(player)) {
				return Networking.Skip;
			}

			throttle.add(player);
			setTimeout(() => {
				throttle.delete(player);
			}, time);

			return processNext(player, ...args);
		};
	};
}
