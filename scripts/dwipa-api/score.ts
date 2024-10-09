import { Entity, Player, ScoreboardIdentity, system, world } from "@minecraft/server";
import Database from "./database";

class ScoreData {
    
    static updateData() {
        for (const player of world.getAllPlayers()) ScoreData.register(player);
    }

    /**Register player score id */
    static register(player: Player): void {
        let ids = this.getScoreIds();
        const sid = player.scoreboardIdentity?.id;

        if (sid !== undefined && !ids.hasOwnProperty(player.id)) {
            ids[player.id] = sid;
            Database.set("score-ids");
        }
    }

    /**Get score data by entity */
    static get(target: Entity): ScoreData {
        return new ScoreData(target.scoreboardIdentity?.id ?? -1);
    }

    /**Get score data by player id */
    static getPlayer(playerId: string): ScoreData {
        return new ScoreData(this.getScoreId(playerId));
    }

    /**Get all player score identity */
    static getScoreIds(): Record<string, number> {
        return Database.get<Record<string, number>>("score-ids") ?? {};
    }

    /**
     * Get player score identity with player id
     * @return (scoreId) if found. (-1) if not found
     */
    static getScoreId(playerId: string): number {
        const data = Database.get("score-ids");
        if (typeof data === "object") return data[playerId] ?? -1;
        return -1;
    }

    /**
     * Get player id with number score identity
     * @returns "playerId" if found, "" if not found
     *  */
    static getPlayerId(scoreId: number): string {
        const data = Database.get("score-ids");
        if (typeof data === "object") return Object.entries(data).find(([kay, id]) => id === scoreId)?.[0] as string ?? "";
        return "";
    }

    /**Get score identity with number score identity */
    static getScoreIdentity(scoreId: number): ScoreboardIdentity|undefined {
        return world.scoreboard.getParticipants().find((v) => v.id === scoreId);
    }

    /**
     * Get player score
     * @param playerId Player id
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and player score id found, -1 if objective or player score id not found
     */
    static getPlayerScore(playerId: string, objectiveId: string): number {
        const scoreId = ScoreData.getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity) return -1;

        const objective = world.scoreboard.getObjective(objectiveId);
        if (!objective) return -1;
        const score = objective.getScore(scoreIdentity);
        if (!score) return 0;
        return score;
    }

    /**
     * Get score
     * @param scoreId Scoreboard Identity ID
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and score id found, -1 if objective or score id not found
     */
    static getScore(scoreId: number, objectiveId: string): number {
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity) return -1;

        const objective = world.scoreboard.getObjective(objectiveId);
        if (!objective) return -1;
        const score = objective.getScore(scoreIdentity);
        if (!score) return 0;
        return score;
    }

    /**
     * Add target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if invalid score number or objective not found
     */
    static addScore(scoreIdentity: ScoreboardIdentity, objectiveId: string, score: number, fixObj: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            system.run(() => {
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        } else resolve(false);
                        return;
                    }

                    if (score < 0 || score === 0) {
                        resolve(false);
                        return;
                    }

                    objective.addScore(scoreIdentity, score);
                    resolve(true);
                } catch(err) { resolve(false) }
            });
        });
    }

    /**
     * Remove target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param minScore Return false if score under minScore
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if invalid score number or objective not found
     */
    static removeScore(scoreIdentity: ScoreboardIdentity, objectiveId: string, score: number, minScore?: number, fixObj: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            system.run(() => {
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        } else resolve(false);
                        return;
                    }

                    if (score < 0 || score === 0) {
                        resolve(false);
                        return;
                    }
                    if (minScore && (objective.getScore(scoreIdentity) ?? 0) - score < minScore) {
                        resolve(false);
                        return;
                    }

                    objective.setScore(scoreIdentity, (objective.getScore(scoreIdentity) ?? 0)-score);
                    resolve(true);
                } catch(err) { resolve(false) }
            });
        });
    }

    /**
     * Set target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if target score id or objective not found
     */
    static setScore(scoreIdentity: ScoreboardIdentity, objectiveId: string, score: number, fixObj: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            system.run(() => {
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        } else resolve(false);
                        return;
                    }

                    objective.setScore(scoreIdentity, score);
                    resolve(true);
                } catch(err) { resolve(false) }
            });
        });
    }

    constructor(readonly scoreId: number) {}

    /**
     * Get score identity id
     * @return (scoreId) if found. (-1) if not found
     */
    getScoreId(): number {
        return ScoreData.getScoreIdentity(this.scoreId) ? this.scoreId : -1;
    }

    /**
     * Get player id
     * @returns "playerId" if found, "" if not found
     *  */
    getPlayerId(): string {
        return ScoreData.getPlayerId(this.scoreId);
    }
    
    /**Get score identity with number score identity */
    getScoreIdentity(): ScoreboardIdentity|null {
        return ScoreData.getScoreIdentity(this.scoreId) ?? null;
    }

    /**
     * Get score
     * @param scoreId Scoreboard Identity ID
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and score id found, -1 if objective or score id not found
     */
    getScore(objectiveId: string): number {
        return ScoreData.getScore(this.scoreId, objectiveId);
    }

    /**
     * Add target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if invalid score number or objective not found
     */
    addScore(objectiveId: string, score: number, fixObj: boolean = false): Promise<boolean> {
        const scoreId = this.getScoreIdentity();
        if (!scoreId) return new Promise((r) => r(false));
        return ScoreData.addScore(scoreId, objectiveId, score, fixObj);
    }

    /**
     * Remove target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param minScore Return false if score under minScore
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if invalid score number or objective not found
     */
    removeScore(objectiveId: string, score: number, minScore?: number, fixObj: boolean = false): Promise<boolean> {
        const scoreId = this.getScoreIdentity();
        if (!scoreId) return new Promise((r) => r(false));
        return ScoreData.removeScore(scoreId, objectiveId, score, minScore, fixObj);
    }

    /**
     * Set target score
     * @param scoreIdentity Target Scoreboard Identity
     * @param objectiveId Scoreboard objective id
     * @param score Score will be added
     * @param fixObj If objective not found will be create a new one
     * @returns true if don't have any error, false if target score id or objective not found
     */
    setScore(objectiveId: string, score: number, fixObj: boolean = false): Promise<boolean> {
        const scoreId = this.getScoreIdentity();
        if (!scoreId) return new Promise((r) => r(false));
        return ScoreData.setScore(scoreId, objectiveId, score, fixObj);
    }
}

export default ScoreData;