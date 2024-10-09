import { Player, ScoreboardIdentity, world } from "@minecraft/server"
import Database from "./database"
import ScoreData from "./score";

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

    static getScoreId(id: string): number {
        return ScoreData.getScoreId(id);
    }

    static getScoreIdentity(id: string): ScoreboardIdentity|null {
        return ScoreData.getScoreIdentity(this.getScoreId(id)) ?? null;
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

    getScoreId(): number {
        return PlayerData.getScoreId(this.id);
    }

    getScoreIdentity(): ScoreboardIdentity|null {
        return PlayerData.getScoreIdentity(this.id);
    }
}

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) PlayerData.register(ev.player);
});

export default PlayerData;