export interface TextChannelServerToClientEvents {
	sendMessage(textChannel: TextChannel, message: string, metadata?: string): void;
}
