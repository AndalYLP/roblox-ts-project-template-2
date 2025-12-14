import { TransformResult, TypeBuilder } from "@rbxts/centurion";
import { Players } from "@rbxts/services";
import { customCenturionType } from "shared/centurion/types";

export const username = TypeBuilder.create<number>(customCenturionType.username)
	.transform((name) => {
		try {
			const userId = Players.GetUserIdFromNameAsync(name);

			return TransformResult.ok(userId);
		} catch (err) {
			return TransformResult.err(`Error getting userId: ${err}`);
		}
	}, true)
	.suggestions(() => Players.GetPlayers().map((player) => player.Name))
	.markForRegistration()
	.build();
