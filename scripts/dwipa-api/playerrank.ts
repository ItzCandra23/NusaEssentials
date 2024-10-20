import { Player, system, world } from "@minecraft/server";
import Database from "./database";
import PlayerData from "./player";
import RankPerms from "./rankpermissions";
import EventEmitter from "./utils/eventEmitter";

export interface PlayerRankChangeEvent {
    readonly playerId: string;
    readonly beforeRankId: string;
    rankId: string;
}

export interface PlayerNameTagChangeEvent {
    readonly player: Player;
    nameTag: string;
}

const eventEmitter = new EventEmitter();

class PlayerRank {

    /**
     * Get All Players Rank
     * @returns <PlayerId, RankId>
     */
    static getPlayers(): Record<string, string> {
        return Database.get<Record<string, string>>("player-rank") ?? {};
    }

    /**
     * Get Player Rank Id
     * @param playerId Player Id
     * @returns (string) Player Rank Id
     */
    static getRankId(playerId: string): string {
        const rankId = PlayerRank.getPlayers()[playerId];
        const rank = RankPerms.getRank(rankId ?? "");

        if (!rank) return Object.keys(RankPerms.getRawRanks())[0];
        return rank.getRankId();
    }

    /**
     * Get Player Rank
     * @param playerId Player Id
     * @returns Player Rank
     */
    static getRank(playerId: string): RankPerms {
        const rankId = PlayerRank.getPlayers()[playerId];
        const rank = RankPerms.getRank(rankId ?? "");

        if (!rank) return new RankPerms(Object.keys(RankPerms.getRawRanks())[0]);
        return rank;
    }

    /**
     * Set Player Rank
     * @param playerId player Id
     * @param rankId Rank Id
     * @throws "playerrank.error.notfound.player" Player Id not found
     * @throws "playerrank.error.notfound.rank" Rank Id not found
     * @throws "playerrank.error.already" Player Rank same with Rank Id
     * @returns (void) -- Success to set
     */
    static setPlayer(playerId: string, rankId: string): Promise<void> {
        return new Promise((resolve, reject) => system.run(async () => {
            let ranks = Object.keys(RankPerms.getRawRanks());
            let dataplayers = PlayerRank.getPlayers();

            if (!PlayerData.getPlayerName(playerId)) return reject("playerrank.error.notfound.player");
            if (!ranks.includes(rankId)) return reject("playerrank.error.notfound.rank");
            if (PlayerRank.getRankId(playerId) === rankId) return reject("playerrank.error.already");

            let data: PlayerRankChangeEvent = {
                playerId,
                beforeRankId: PlayerRank.getRankId(playerId),
                rankId,
            };

            await eventEmitter.emit<PlayerRankChangeEvent>("PlayerRankChange", data);

            dataplayers[playerId] = rankId;
            Database.set<Record<string, string>>("player-rank", dataplayers);

            resolve();
        }));
    }

    static onPlayerRankChange(callback: (data: PlayerRankChangeEvent) => void) {
        return eventEmitter.on("PlayerRankChange", callback);
    }

    static onPlayerNameTagChange(callback: (data: PlayerNameTagChangeEvent) => void) {
        return eventEmitter.on("PlayerNameTagChange", callback);
    }

    static getFormatChat(playerId: string, message: string, chat?: string): string|null {
        const playerNameTag = PlayerData.getPlayerName(playerId);
        const rank = PlayerRank.getRank(playerId);

        if (!playerNameTag) return null;
        return (chat ?? rank.getFormatChat()).replace(/{rank}/g, rank.getRankId()).replace(/{display}/g, rank.getDisplay()).replace(/{player}/g, playerNameTag).replace(/{message}/g, message);
    }

    static getFormatNameTag(playerId: string, nameTag?: string): string|null {
        const playerNameTag = PlayerData.getPlayerName(playerId);
        const rank = PlayerRank.getRank(playerId);

        if (!playerNameTag) return null;
        return (nameTag ?? rank.getFormatNameTag()).replace(/{rank}/g, rank.getRankId()).replace(/{display}/g, rank.getDisplay()).replace(/{player}/g, playerNameTag);
    }

    static getPermissions(playerId: string): string[] {
        return PlayerRank.getRank(playerId).getPermissions();
    }

    static hasPermission(playerId: string|Player, permission: string): boolean {
        if (typeof playerId === "object") {
            if (playerId.getTags().some((v) => v.toUpperCase() === "ADMIN")) return true;
            else return PlayerRank.getRank(playerId.id).hasPermission(permission)
        }
        return PlayerRank.getRank(playerId).hasPermission(permission);
    }

    static isAdmin(playerId: string|Player): boolean {
        if (typeof playerId === "object") return playerId.getTags().some((v) => v.toUpperCase() === "ADMIN");
        return PlayerRank.getRank(playerId).isAdmin();
    }

    static updatePlayerName(player: Player): Promise<boolean> {
        return new Promise(async (resolve) => {
            let data = {
                player,
                nameTag: PlayerRank.getRank(player.id).getFormatNameTag(),
            };
                
            try {
                await eventEmitter.emit("PlayerNameTagChange", data);
            } catch(err) {}

            player.nameTag = PlayerRank.getFormatNameTag(player.id, data.nameTag) ?? player.nameTag;
            resolve(true);
        });
    }
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) try { PlayerRank.updatePlayerName(player); } catch(err) {}
}, 10);

export default PlayerRank;