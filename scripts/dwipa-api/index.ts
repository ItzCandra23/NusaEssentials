import "./langs/index";
import "./player";
import "./playerrank";
import "./command";
import { command, CommandPermissionLevel } from "./command";
import Translate from "./translate";
import NusaConfiguration from "./configuration";

command.register("ping", "w", "test", CommandPermissionLevel.NORMAL, (p, player) => {
    player.sendMessage(JSON.stringify(NusaConfiguration.getConfig(p.hmm), undefined, 4));
}, {
    hmm: "string"
});