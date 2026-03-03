import type { CommandGuard } from "@rbxts/centurion";

import { DEVELOPERS, IS_STUDIO } from "shared/constants/core";

export const isDeveloper: CommandGuard = (context) => {
	if (IS_STUDIO || DEVELOPERS.includes(tostring(context.executor.UserId))) {
		return true;
	}

	context.error("Insufficient permission.");
	return false;
};
