import { Player, ScoreboardIdentity, world } from "@minecraft/server"
import Database from "./database"
import ScoreData from "./score";
import PlayerRank from "./playerrank";
import Translate from "./translate";

class PlayerData {

    static register(player: Player): void {
        let players = Database.get<Record<string, string>>("player-data") ?? {};

        if (!players.hasOwnProperty(player.id) || players[player.id] !== player.name) {
            players[player.id] = player.name;
            Database.set("player-data", players);
        }
    }

    static get(id: string): PlayerData|null {
        let players = Database.get<Record<string, string>>("player-data") ?? {};

        if (players.hasOwnProperty(id)) return new PlayerData(id);
        return null;
    }

    static getByName(username: string): PlayerData|null {
        let players = Database.get<Record<string, string>>("player-data") ?? {};

        for (const [id, name] of Object.entries(players)) {
            if (name.toLowerCase() === username.toLowerCase()) {
                return new PlayerData(id);
            }
        }

        return null;
    }

    static getPlayerId(username: string): string|null {
        let players = Database.get<Record<string, string>>("player-data") ?? {};
        
        for (const [id, name] of Object.entries(players)) {
            if (name.toLowerCase() === username.toLowerCase()) {
                return id;
            }
        }

        return null;
    }

    static getPlayerName(id: string): string|null {
        let players = Database.get<Record<string, string>>("player-data") ?? {};
        
        if (!players.hasOwnProperty(id)) return null;
        return players[id];
    }

    static getPlayer(id: string): Player|undefined {
        return world.getAllPlayers().find((v) => v.id === id);
    }

    static getScore(id: string, objective: string): number {
        return ScoreData.getPlayerScore(id, objective);
    }

    static addScore(id: string, objective: string, score: number, fixObj?: boolean) {
        return ScoreData.getPlayer(id).addScore(objective, score, fixObj);
    }

    static removeScore(id: string, objective: string, score: number, minScore?: number, fixObj?: boolean) {
        return ScoreData.getPlayer(id).removeScore(objective, score, minScore, fixObj);
    }

    static setScore(id: string, objective: string, score: number, fixObj?: boolean) {
        return ScoreData.getPlayer(id).setScore(objective, score, fixObj);
    }

    static getScoreId(id: string): number {
        return ScoreData.getScoreId(id);
    }

    static getScoreIdentity(id: string): ScoreboardIdentity|null {
        return ScoreData.getScoreIdentity(this.getScoreId(id)) ?? null;
    }

    static getRankId(id: string): string {
        return PlayerRank.getRankId(id);
    }

    static setRankId(id: string, rankId: string) {
        return PlayerRank.setPlayer(id, rankId);
    }

    static sendTranslateMessage(player: Player, text: string, replace?: [string, string] | [string, string][]): void {
        return player.sendMessage(Translate.translate(text, replace));
    }

    constructor(readonly id: string) {}

    getName(): string {
        return PlayerData.getPlayerName(this.id) ?? "";
    }

    getId(): string {
        return this.id;
    }

    getPlayer(): Player|undefined {
        return PlayerData.getPlayer(this.id);
    }

    isOnline(): boolean {
        return Boolean(PlayerData.getPlayer(this.id));
    }

    getScore(objective: string): number {
        return PlayerData.getScore(this.id, objective);
    }

    addScore(objective: string, score: number, fixObj?: boolean) {
        return PlayerData.addScore(this.id, objective, score, fixObj);
    }

    removeScore(objective: string, score: number, minScore?: number, fixObj?: boolean) {
        return PlayerData.removeScore(this.id, objective, score, minScore, fixObj);
    }

    setScore(objective: string, score: number, fixObj?: boolean) {
        return PlayerData.setScore(this.id, objective, score, fixObj);
    }

    getScoreId(): number {
        return PlayerData.getScoreId(this.id);
    }

    getScoreIdentity(): ScoreboardIdentity|null {
        return PlayerData.getScoreIdentity(this.id);
    }

    getRankId(): string {
        return PlayerData.getRankId(this.id);
    }

    setRankId(rankId: string) {
        return PlayerData.setRankId(this.id, rankId);
    }

    sendTranslateMessage(text: string, replace?: [string, string] | [string, string][]): void {
        const player = this.getPlayer();
        if (!player) return;

        return PlayerData.sendTranslateMessage(player, text, replace);
    }
}

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) PlayerData.register(ev.player);
});

export default PlayerData;