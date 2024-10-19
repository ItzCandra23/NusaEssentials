import { system, world } from "@minecraft/server";
import { command, CommandPermissionLevel } from "../command";
import RankPermsUI from "../rank-ui";
command.register("rankadm", "commands.rankadm.description", "RankPerms", CommandPermissionLevel.ADMIN, (p, player) => {
    player.sendMessage(JSON.stringify(p));
    RankPermsUI.main(player);
}, {
    option: [[
            "help",
        ], true],
});
world.beforeEvents.playerBreakBlock.subscribe((ev) => system.run(() => {
    ev.player.sendMessage("wow");
    // new MessageFormData().title("title").body("body").button1("button1").button2("button2").show(ev.player as any).then((res) => ev.player.sendMessage(JSON.stringify(res.selection)));
    RankPermsUI.main(ev.player);
}));
