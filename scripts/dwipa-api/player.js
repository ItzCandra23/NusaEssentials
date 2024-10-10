import { world } from "@minecraft/server";
import Database from "./database";
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
        for (const id of Object.keys(players)) {
            if (players[id].toLowerCase() === username.toLowerCase()) {
                return new PlayerData(id);
            }
        }
        return null;
    }
    static getPlayerId(username) {
        var _a;
        let players = (_a = Database.get("player-data")) !== null && _a !== void 0 ? _a : {};
        for (const id of Object.keys(players)) {
            if (players[id].toLowerCase() === username.toLowerCase()) {
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
}
world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn)
        PlayerData.register(ev.player);
});
export default PlayerData;
