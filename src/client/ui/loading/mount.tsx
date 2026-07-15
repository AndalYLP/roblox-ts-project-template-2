import { RunService } from "@rbxts/services";
import Vide, { mount, source } from "@rbxts/vide";

import { PLAYER_GUI } from "client/constants/player";
import { LoadingScreen } from "client/ui/loading/loading-screen";

/** How long the fade-out animation takes, in seconds. */
const FADE_TIME = 0.4;

/**
 * Mounts the Vide loading screen immediately. Returns a `finish` callback that
 * fades the screen out and unmounts it once the client is ready.
 *
 * `finish` is idempotent: calling it again is a no-op, so it is safe to trigger
 * from more than one place (say, a readiness signal and a safety timeout).
 */
export function mountLoadingScreen(): () => void {
	const transparency = source(0);
	const unmount = mount(() => <LoadingScreen transparency={transparency} />, PLAYER_GUI);
	let finished = false;

	return () => {
		if (finished) {
			return;
		}

		finished = true;

		task.spawn(() => {
			const start = os.clock();
			let alpha = 0;
			while (alpha < 1) {
				alpha = math.min((os.clock() - start) / FADE_TIME, 1);
				transparency(alpha);
				RunService.RenderStepped.Wait();
			}

			unmount();
		});
	};
}
