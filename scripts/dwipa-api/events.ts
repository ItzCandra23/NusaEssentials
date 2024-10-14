import { Player } from "@minecraft/server";
import { CustomCommandFactory } from "./command";
import PlayerRank from "./playerrank";

export interface PlayerNameTagChangeEvent {
    readonly player: Player;
    nameTag: string;
}

export interface PlayerChatEvent { 
    readonly player: Player; 
    targets: Player[]; 
    chat: string; 
    message: string; 
    cancel: boolean; 
}

export interface PlayerRankChange {
    readonly playerId: string;
    readonly beforeRankId: string;
    rankId: string;
}

namespace NusaEvents {

    export function onPlayerNameTagChange(callback: (ev: PlayerNameTagChangeEvent) => void) {
        PlayerRank.onPlayerNameTagChange(callback);
    }

    export function onPlayerChat(callback: (ev: PlayerChatEvent) => void) {
        CustomCommandFactory.onPlayerChat(callback);
    }

    export function onPlayerRankChange(callback: (ev: PlayerRankChange) => void) {
        PlayerRank.onPlayerRankChange(callback);
    }
}

export default NusaEvents;