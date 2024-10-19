import { command, CommandPermissionLevel } from "../command";
import RankPermsUI from "../rank-ui";

command.register("rankadm", "commands.rankadm.description", "RankPerms", CommandPermissionLevel.ADMIN, (p, player) => {
    player.sendMessage(JSON.stringify(p));
    RankPermsUI.main(player);
}, {
});