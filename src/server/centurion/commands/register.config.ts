import { RegisterOptions } from "@rbxts/centurion";

export const groupRegisterOptions = {
	moderation: {
		groups: [
			{
				name: "moderation",
				description: "Moderation related commands"
			}
		]
	}
} satisfies Record<string, RegisterOptions>
