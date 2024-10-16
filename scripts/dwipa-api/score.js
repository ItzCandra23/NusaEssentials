import { system, world } from "@minecraft/server";
import Database from "./database";
class ScoreData {
    static updateData() {
        for (const player of world.getAllPlayers())
            ScoreData.register(player);
    }
    /**Register player score id */
    static register(player) {
        var _a;
        let ids = this.getScoreIds();
        const sid = (_a = player.scoreboardIdentity) === null || _a === void 0 ? void 0 : _a.id;
        if (sid !== undefined && !ids.hasOwnProperty(player.id)) {
            ids[player.id] = sid;
            Database.set("score-ids");
        }
    }
    /**Get score data by entity */
    static get(target) {
        var _a, _b;
        return new ScoreData((_b = (_a = target.scoreboardIdentity) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : -1);
    }
    /**Get score data by player id */
    static getPlayer(playerId) {
        return new ScoreData(this.getScoreId(playerId));
    }
    /**Get all player score identity */
    static getScoreIds() {
        var _a;
        return (_a = Database.get("score-ids")) !== null && _a !== void 0 ? _a : {};
    }
    /**
     * Get player score identity with player id
     * @return (scoreId) if found. (-1) if not found
     */
    static getScoreId(playerId) {
        var _a;
        const data = Database.get("score-ids");
        if (typeof data === "object")
            return (_a = data[playerId]) !== null && _a !== void 0 ? _a : -1;
        return -1;
    }
    /**
     * Get player id with number score identity
     * @returns "playerId" if found, "" if not found
     *  */
    static getPlayerId(scoreId) {
        var _a, _b;
        const data = Database.get("score-ids");
        if (typeof data === "object")
            return (_b = (_a = Object.entries(data).find(([kay, id]) => id === scoreId)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "";
        return "";
    }
    /**Get score identity with number score identity */
    static getScoreIdentity(scoreId) {
        return world.scoreboard.getParticipants().find((v) => v.id === scoreId);
    }
    /**
     * Get player score
     * @param playerId Player id
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and player score id found, -1 if objective or player score id not found
     */
    static getPlayerScore(playerId, objectiveId) {
        const scoreId = ScoreData.getScoreId(playerId);
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return -1;
        const objective = world.scoreboard.getObjective(objectiveId);
        if (!objective)
            return -1;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
        return score;
    }
    /**
     * Get score
     * @param scoreId Scoreboard Identity ID
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and score id found, -1 if objective or score id not found
     */
    static getScore(scoreId, objectiveId) {
        const scoreIdentity = world.scoreboard.getParticipants().find((v) => v.id === scoreId);
        if (!scoreIdentity)
            return -1;
        const objective = world.scoreboard.getObjective(objectiveId);
        if (!objective)
            return -1;
        const score = objective.getScore(scoreIdentity);
        if (!score)
            return 0;
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
    static addScore(scoreIdentity, objectiveId, score, fixObj = false) {
        return new Promise((resolve, reject) => {
            system.run(() => {
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        }
                        else
                            resolve(false);
                        return;
                    }
                    if (score < 0 || score === 0) {
                        resolve(false);
                        return;
                    }
                    objective.addScore(scoreIdentity, score);
                    resolve(true);
                }
                catch (err) {
                    resolve(false);
                }
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
    static removeScore(scoreIdentity, objectiveId, score, minScore, fixObj = false) {
        return new Promise((resolve, reject) => {
            system.run(() => {
                var _a, _b;
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        }
                        else
                            resolve(false);
                        return;
                    }
                    if (score < 0 || score === 0) {
                        resolve(false);
                        return;
                    }
                    if (minScore && ((_a = objective.getScore(scoreIdentity)) !== null && _a !== void 0 ? _a : 0) - score < minScore) {
                        resolve(false);
                        return;
                    }
                    objective.setScore(scoreIdentity, ((_b = objective.getScore(scoreIdentity)) !== null && _b !== void 0 ? _b : 0) - score);
                    resolve(true);
                }
                catch (err) {
                    resolve(false);
                }
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
    static setScore(scoreIdentity, objectiveId, score, fixObj = false) {
        return new Promise((resolve, reject) => {
            system.run(() => {
                try {
                    const objective = world.scoreboard.getObjective(objectiveId);
                    if (!objective) {
                        if (fixObj) {
                            world.scoreboard.addObjective(objectiveId);
                            resolve(ScoreData.addScore(scoreIdentity, objectiveId, score));
                        }
                        else
                            resolve(false);
                        return;
                    }
                    objective.setScore(scoreIdentity, score);
                    resolve(true);
                }
                catch (err) {
                    resolve(false);
                }
            });
        });
    }
    constructor(scoreId) {
        this.scoreId = scoreId;
    }
    /**
     * Get score identity id
     * @return (scoreId) if found. (-1) if not found
     */
    getScoreId() {
        return ScoreData.getScoreIdentity(this.scoreId) ? this.scoreId : -1;
    }
    /**
     * Get player id
     * @returns "playerId" if found, "" if not found
     *  */
    getPlayerId() {
        return ScoreData.getPlayerId(this.scoreId);
    }
    /**Get score identity with number score identity */
    getScoreIdentity() {
        var _a;
        return (_a = ScoreData.getScoreIdentity(this.scoreId)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Get score
     * @param scoreId Scoreboard Identity ID
     * @param objectiveId Scoreboard objective id
     * @returns (score) if objective and score id found, -1 if objective or score id not found
     */
    getScore(objectiveId) {
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
    addScore(objectiveId, score, fixObj = false) {
        const scoreId = this.getScoreIdentity();
        if (!scoreId)
            return new Promise((r) => r(false));
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
    removeScore(objectiveId, score, minScore, fixObj = false) {
        const scoreId = this.getScoreIdentity();
        if (!scoreId)
            return new Promise((r) => r(false));
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
    setScore(objectiveId, score, fixObj = false) {
        const scoreId = this.getScoreIdentity();
        if (!scoreId)
            return new Promise((r) => r(false));
        return ScoreData.setScore(scoreId, objectiveId, score, fixObj);
    }
}
export default ScoreData;
