import Database from "./database";

export interface RankData {
    display: string;
    permissions: string[];
}

export class RankPerms {

    static getRawRanks(): Record<string, RankData> {
        return Database.get<Record<string, RankData>>("ranks") ?? {};
    }

    static createRank(rankId: string, display: string = rankId, permissions: string[] = []): RankPerms|null {
        let ranks = this.getRawRanks();
        const idRegex = /^[a-zA-Z0-9]+$/;
        const permRegex = /^[a-zA-Z0-9\.]+$/;
        
        if (!idRegex.test(rankId) || rankId.length > 24) return null;
        if (ranks.hasOwnProperty(rankId)) return null;

        let data: RankData = {
            display,
            permissions: permissions.filter((v) => !permRegex.test(v)),
        };

        ranks[rankId] = data;
        Database.set("ranks", ranks);

        return new RankPerms(rankId);
    }

    constructor(rankId: string) {}
}