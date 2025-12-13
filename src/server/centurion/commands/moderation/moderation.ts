import { Command, CommandContext, Group, Guard, Register } from "@rbxts/centurion";
import { Players } from "@rbxts/services";
import { moderationCommandOptions } from "server/centurion/commands/moderation/moderation.config";
import { isDeveloper } from "server/centurion/guards/is-developer";


@Register()
	@Guard(isDeveloper)
	@Group("moderation")
export class ModerationCommands {
	@Command(moderationCommandOptions.ban)
	public ban(
		commandContext: CommandContext,
		userId: number,
		reason: string,
		duration: number,
	): void {
		try {
			Players.BanAsync({
				DisplayReason: reason,
				Duration: duration,
				PrivateReason: reason,
				UserIds: [userId],
			});

			commandContext.reply(`Banned ${userId}.`);
		} catch (err) {
			commandContext.error(`Error banning user ${userId}: ${err}`);
		}
	}

	@Command(moderationCommandOptions.unban)
	public unban(commandContext: CommandContext, userId: number): void {
		try {
			Players.UnbanAsync({ UserIds: [userId] });

			commandContext.reply(`Unbanned ${userId}`);
		} catch (err) {
			commandContext.error(`Error unbanning ${userId}: ${err}`);
		}
	}

	@Command(moderationCommandOptions.kick)
	public kick(commandContext: CommandContext, player: Player, reason?: string): void {
		try {
			player.Kick(reason);

			commandContext.reply(`Player ${player.UserId} kicked.`);
		} catch (err) {
			commandContext.error(`Error kicking player: ${err}`);
		}
	}
}