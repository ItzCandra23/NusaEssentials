import { system, world } from "@minecraft/server";
import Database from "./database";
import PlayerData from "./player";
import RankPerms from "./rankpermissions";
import EventEmitter from "./utils/eventEmitter";
const eventEmitter = new EventEmitter();
class PlayerRank {
    /**
     * Get All Players Rank
     * @returns <PlayerId, RankId>
     */
    static getPlayers() {
        var _a;
        return (_a = Database.get("player-rank")) !== null && _a !== void 0 ? _a : {};
    }
    /**
     * Get Player Rank Id
     * @param playerId Player Id
     * @returns (string) Player Rank Id
     */
    static getRankId(playerId) {
        const rankId = PlayerRank.getPlayers()[playerId];
        const rank = RankPerms.getRank(rankId !== null && rankId !== void 0 ? rankId : "");
        if (!rank)
            return Object.keys(RankPerms.getRawRanks())[0];
        return rank.getRankId();
    }
    /**
     * Get Player Rank
     * @param playerId Player Id
     * @returns Player Rank
     */
    static getRank(playerId) {
        const rankId = PlayerRank.getPlayers()[playerId];
        const rank = RankPerms.getRank(rankId !== null && rankId !== void 0 ? rankId : "");
        if (!rank)
            return new RankPerms(Object.keys(RankPerms.getRawRanks())[0]);
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
    static setPlayer(playerId, rankId) {
        return new Promise((resolve, reject) => system.run(async () => {
            let ranks = Object.keys(RankPerms.getRawRanks());
            let dataplayers = PlayerRank.getPlayers();
            if (!PlayerData.getPlayerName(playerId))
                reject("playerrank.error.notfound.player");
            if (!ranks.hasOwnProperty(rankId))
                reject("playerrank.error.notfound.rank");
            if (PlayerRank.getRankId(playerId) === rankId)
                reject("playerrank.error.already");
            let data = {
                playerId,
                beforeRankId: PlayerRank.getRankId(playerId),
                rankId,
            };
            await eventEmitter.emit("PlayerRankChange", data);
            dataplayers[playerId] = rankId;
            Database.set("player-rank", dataplayers);
            resolve();
        }));
    }
    static onPlayerRankChange(callback) {
        return eventEmitter.on("PlayerRankChange", callback);
    }
    static onPlayerNameTagChange(callback) {
        return eventEmitter.on("PlayerNameTagChange", callback);
    }
    static getFormatChat(playerId, message, chat) {
        const playerNameTag = PlayerData.getPlayerName(playerId);
        const rank = PlayerRank.getRank(playerId);
        if (!playerNameTag)
            return null;
        return (chat !== null && chat !== void 0 ? chat : rank.getFormatChat()).replace(/{rank}/g, rank.getRankId()).replace(/{display}/g, rank.getDisplay()).replace(/{player}/g, playerNameTag).replace(/{message}/g, message);
    }
    static getFormatNameTag(playerId, nameTag) {
        const playerNameTag = PlayerData.getPlayerName(playerId);
        const rank = PlayerRank.getRank(playerId);
        if (!playerNameTag)
            return null;
        return (nameTag !== null && nameTag !== void 0 ? nameTag : rank.getFormatNameTag()).replace(/{rank}/g, rank.getRankId()).replace(/{display}/g, rank.getDisplay()).replace(/{player}/g, playerNameTag);
    }
    static getPermissions(playerId) {
        return PlayerRank.getRank(playerId).getPermissions();
    }
    static hasPermission(playerId, permission) {
        if (typeof playerId === "object") {
            if (playerId.getTags().some((v) => v.toUpperCase() === "ADMIN"))
                return true;
            else
                return PlayerRank.getRank(playerId.id).hasPermission(permission);
        }
        return PlayerRank.getRank(playerId).hasPermission(permission);
    }
    static isAdmin(playerId) {
        if (typeof playerId === "object")
            return playerId.getTags().some((v) => v.toUpperCase() === "ADMIN");
        return PlayerRank.getRank(playerId).isAdmin();
    }
    static updatePlayerName(player) {
        return new Promise(async (resolve) => {
            var _a;
            let data = {
                player,
                nameTag: PlayerRank.getRank(player.id).getFormatNameTag(),
            };
            try {
                await eventEmitter.emit("PlayerNameTagChange", data);
            }
            catch (err) { }
            player.nameTag = (_a = PlayerRank.getFormatNameTag(player.id, data.nameTag)) !== null && _a !== void 0 ? _a : player.nameTag;
            resolve(true);
        });
    }
}
system.runInterval(() => {
    for (const player of world.getAllPlayers())
        try {
            PlayerRank.updatePlayerName(player);
        }
        catch (err) { }
}, 10);
export default PlayerRank;
