import { Service } from "@flamework/core";
import Make from "@rbxts/make";
import { Players, TextChatService } from "@rbxts/services";
import type { Logger } from "@rbxts/log";

import { events } from "server/network";
import { DEVELOPERS } from "shared/constants/core";
import { deletePlayerTagData, setPlayerChatTag } from "shared/store/atoms/player/chat-tag";
import type { OnPlayerJoin, OnPlayerLeave } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";
import type { PlayerChatTagData } from "shared/store/atoms/player/chat-tag";

@Service()
export class TextChannelService implements OnPlayerJoin, OnPlayerLeave {
	public readonly chatTags = {
		developer: {
			name: "Dev",
			color: Color3.fromRGB(56, 179, 224),
		},
	} satisfies Record<string, PlayerChatTagData>;

	constructor(private readonly logger: Logger) {}

	public onPlayerJoin({ userId }: PlayerEntity): void {
		if (DEVELOPERS.includes(userId)) {
			setPlayerChatTag(userId, this.chatTags.developer);
		}
	}

	public onPlayerLeave({ userId }: PlayerEntity): void {
		deletePlayerTagData(userId);
	}

	public createChannel(name: string): TextChannel {
		return Make("TextChannel", {
			Name: name,
			Parent: TextChatService.WaitForChild("TextChannels"),
		});
	}

	public getPlayersOnChannel(channel: TextChannel): Player[] {
		const result: Player[] = [];
		channel.GetChildren().forEach((instance) => {
			if (!instance.IsA("TextSource")) {
				return;
			}

			const player = Players.GetPlayerByUserId(instance.UserId);
			if (player) {
				result.push(player);
			}
		});

		return result;
	}

	public sendMessage(channel: TextChannel, message: string, metadata?: string): void {
		events.textChannel.sendMessage(
			this.getPlayersOnChannel(channel),
			channel,
			message,
			metadata,
		);
	}
}
