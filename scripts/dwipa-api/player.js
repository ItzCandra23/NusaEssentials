import { world } from "@minecraft/server";
import Database from "./database";
import ScoreData from "./score";
import PlayerRank from "./playerrank";
import Translate from "./translate";
class PlayerData {
    static register(player) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        if (!players.hasOwnProperty(player.id) || players[player.id] !== player.name) {
            players[player.id] = player.name;
            Database.set("player-data", players);
        }
    }
    static get(id) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        if (players.hasOwnProperty(id))
            return new PlayerData(id);
        return null;
    }
    static getByName(username) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        for (const [id, name] of Object.entries(players)) {
            if (name.toLowerCase() === username.toLowerCase()) {
                return new PlayerData(id);
            }
        }
        return null;
    }
    static getPlayerId(username) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        for (const [id, name] of Object.entries(players)) {
            if (name.toLowerCase() === username.toLowerCase()) {
                return id;
            }
        }
        return null;
    }
    static getPlayerName(id) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        if (!players.hasOwnProperty(id))
            return null;
        return players[id];
    }
    static getPlayer(id) {
        return world.getAllPlayers().find((v) => v.id === id);
    }
    static getScore(id, objective) {
        return ScoreData.getPlayerScore(id, objective);
    }
    static addScore(id, objective, score, fixObj) {
        return ScoreData.getPlayer(id).addScore(objective, score, fixObj);
    }
    static removeScore(id, objective, score, minScore, fixObj) {
        return ScoreData.getPlayer(id).removeScore(objective, score, minScore, fixObj);
    }
    static setScore(id, objective, score, fixObj) {
        return ScoreData.getPlayer(id).setScore(objective, score, fixObj);
    }
    static getScoreId(id) {
        return ScoreData.getScoreId(id);
    }
    static getScoreIdentity(id) {
        var _a;
        return (_a = ScoreData.getScoreIdentity(this.getScoreId(id))) !== null && _a !== void 0 ? _a : null;
    }
    static getRankId(id) {
        return PlayerRank.getRankId(id);
    }
    static setRankId(id, rankId) {
        return PlayerRank.setPlayer(id, rankId);
    }
    static sendTranslateMessage(player, text, replace) {
        return player.sendMessage(Translate.translate(text, replace));
    }
    constructor(id) {
        this.id = id;
    }
    getName() {
        var _a;
        return (_a = PlayerData.getPlayerName(this.id)) !== null && _a !== void 0 ? _a : "";
    }
    getId() {
        return this.id;
    }
    getPlayer() {
        return PlayerData.getPlayer(this.id);
    }
    isOnline() {
        return Boolean(PlayerData.getPlayer(this.id));
    }
    getScore(objective) {
        return PlayerData.getScore(this.id, objective);
    }
    addScore(objective, score, fixObj) {
        return PlayerData.addScore(this.id, objective, score, fixObj);
    }
    removeScore(objective, score, minScore, fixObj) {
        return PlayerData.removeScore(this.id, objective, score, minScore, fixObj);
    }
    setScore(objective, score, fixObj) {
        return PlayerData.setScore(this.id, objective, score, fixObj);
    }
    getScoreId() {
        return PlayerData.getScoreId(this.id);
    }
    getScoreIdentity() {
        return PlayerData.getScoreIdentity(this.id);
    }
    getRankId() {
        return PlayerData.getRankId(this.id);
    }
    setRankId(rankId) {
        return PlayerData.setRankId(this.id, rankId);
    }
    sendTranslateMessage(text, replace) {
        const player = this.getPlayer();
        if (!player)
            return;
        return PlayerData.sendTranslateMessage(player, text, replace);
    }
}
world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn)
        PlayerData.register(ev.player);
});
export default PlayerData;
