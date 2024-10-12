import Database from "./database";
import PlayerData from "./player";
import RankPerms from "./rankpermissions";
import EventEmitter from "./utils/eventEmitter";

export interface PlayerRankChangeEvent {
    readonly playerId: string;
    readonly beforeRankId: string;
    rankId: string;
}

const eventEmitter = new EventEmitter();

class PlayerRank {

    static getPlayers(): Record<string, string> {
        return Database.get<Record<string, string>>("player-rank") ?? {};
    }

    static getRankId(playerId: string): string {
        const rankId = PlayerRank.getPlayers()[playerId];
        const rank = RankPerms.getRank(rankId ?? "");

        if (!rank) return Object.keys(RankPerms.getRawRanks())[0];
        return rank.getRankId();
    }

    static setPlayer(playerId: string, rankId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let ranks = Object.keys(RankPerms.getRawRanks());
            let dataplayers = PlayerRank.getPlayers();

            if (!PlayerData.getPlayerName(playerId)) reject("error.notfound");
            if (!ranks.hasOwnProperty(rankId)) reject("error.notfound.rank");
            if (PlayerRank.getRankId(playerId) === rankId) reject("error.already");

            let data: PlayerRankChangeEvent = {
                playerId,
                beforeRankId: PlayerRank.getRankId(playerId),
                rankId,
            };

            await eventEmitter.emit<PlayerRankChangeEvent>("PlayerRankChange", data);

            dataplayers[playerId] = rankId;
            Database.set<Record<string, string>>("player-rank", dataplayers);

            resolve();
        });
    }

    static onPlayerRankChange(callback: (data: PlayerRankChangeEvent) => void) {
        return eventEmitter.on("PlayerRankChange", callback);
    }
}
