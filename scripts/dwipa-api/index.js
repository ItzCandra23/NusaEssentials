import "./langs/index";
import "./player";
import "./playerrank";
import "./command";
import { command, CommandPermissionLevel } from "./command";
import NusaConfiguration from "./configuration";
command.register("ping", "w", "test", CommandPermissionLevel.NORMAL, (p, player) => {
    player.sendMessage(JSON.stringify(NusaConfiguration.getConfig(p.hmm), undefined, 4));
}, {
    hmm: "string"
});
