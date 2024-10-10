import { ScoreboardIdentityType, world } from "@minecraft/server";
world.beforeEvents.chatSend.subscribe((v) => {
    if (v.message === "a") {
        world.sendMessage(world.scoreboard.getParticipants().map((v) => { var _a; return `${v.id}: ${v.displayName} - ${v.getEntity()?.scoreboardIdentity.id ?? "None"} ${ScoreboardIdentityType[v.type]}`; }).join("\n"));
    }
});
