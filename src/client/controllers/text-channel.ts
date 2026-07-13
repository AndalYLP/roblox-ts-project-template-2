import { Controller } from "@flamework/core";
import { Players, TextChatService } from "@rbxts/services";
import type { OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log";

import { events } from "client/network";
import { getPlayerChatTagData } from "shared/store/atoms/player/chat-tag";

@Controller()
export class TextChannelController implements OnStart {
	constructor(private readonly logger: Logger) {}

	private onPlayerMessage(
		player: Player,
		message: TextChatMessage,
		properties: TextChatMessageProperties,
	): void {
		const playerTagData = getPlayerChatTagData(tostring(player.UserId));

		if (playerTagData === undefined) {
			return;
		}

		properties.PrefixText = this.formatTag(
			playerTagData.name,
			playerTagData.color,
			message.PrefixText,
		);
	}

	public onStart(): void {
		events.textChannel.sendMessage.connect((textChannel, message, metadata) => {
			textChannel.DisplaySystemMessage(message, metadata);
		});

		TextChatService.OnIncomingMessage = (message: TextChatMessage) => {
			const properties = new Instance("TextChatMessageProperties");
			const userId = message.TextSource?.UserId;

			if (userId !== undefined) {
				const player = Players.GetPlayerByUserId(userId);
				if (player) {
					this.onPlayerMessage(player, message, properties);
				}
			}

			return properties;
		};
	}

	private formatTag(tag: string, color: Color3, extra: string): string {
		return `<font color='#${color.ToHex()}'>[${tag}] ${extra}</font>`;
	}
}
