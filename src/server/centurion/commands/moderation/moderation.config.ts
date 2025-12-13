import { CenturionType, CommandOptions } from "@rbxts/centurion";
import { customCenturionType } from "shared/centurion/types";

export const moderationCommandOptions = {
	ban: {
		name: "ban",
		arguments: [
			{
				name: "Username",
				description: "Player's username to ban from the game.",
				type: customCenturionType.username,
			},
			{
				name: "Reason",
				description: "The reason to ban the player.",
				type: CenturionType.String,
			},
			{
				name: "Duration",
				description: "The duration of the ban.",
				type: CenturionType.Number,
			},
		],
		description: "Ban a player from the game.",
	},

	unban: {
		name: "unban",
		arguments: [
			{
				name: "Username",
				description: "Player's username to unban from the game.",
				type: customCenturionType.username,
			},
		],
		description: "Unban a player from the game.",
	},

	kick: {
		name: "kick",
		arguments: [
			{
				name: "Player",
				description: "Player to kick from the game.",
				type: CenturionType.Player,
			},
			{
				name: "Reason",
				description: "Reason of the kick.",
				optional: true,
				type: CenturionType.String,
			},
		],
		description: "Kick a player from the game.",
	}
} satisfies Record<string, CommandOptions>