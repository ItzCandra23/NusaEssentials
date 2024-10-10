import Database from "./database";

class PlayerRank {

    static getPlayers(): Record<string, string> {
        return Database.get<Record<string, string>>("player-rank") ?? {};
    }

    static setPlayer(playerId: string, rankId: string): Promise<void> {
        
    }
}