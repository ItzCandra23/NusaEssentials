import { command, CommandPermissionLevel } from "../command";
import NusaConfiguration from "../configuration";

command.register("config", "commands.config.description", "Commands", CommandPermissionLevel.ADMIN, (p, player) => {
    NusaConfiguration.setConfigUI(player, p.path);
}, {
    path: ["string", true],
});