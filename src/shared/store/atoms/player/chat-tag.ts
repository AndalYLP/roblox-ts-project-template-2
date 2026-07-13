import { playersAtom } from "shared/store/atoms/player/atom";

export interface PlayerChatTagData {
	name: string;
	color: Color3;
}

export function getPlayerChatTagData(userId: string): PlayerChatTagData | undefined {
	return playersAtom.chatTag()[userId];
}

export function setPlayerChatTag(userId: string, chatTagData: PlayerChatTagData): void {
	playersAtom.chatTag((state) => ({ ...state, [userId]: chatTagData }));
}

export function deletePlayerTagData(userId: string): void {
	playersAtom.chatTag((state) => ({
		...state,
		[userId]: undefined,
	}));
}
