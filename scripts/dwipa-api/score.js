import { world } from "@minecraft/server";
class ScoreData {
    static getScoreId(id) {
        world.scoreboard.getParticipants().find((v) => { var _a; return (_a = v.getEntity()) === null || _a === void 0 ? void 0 : _a.id; });
    }
    constructor(id) {
        this.id = id;
    }
}
