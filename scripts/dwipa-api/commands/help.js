import { command, CommandPermissionLevel, CustomCommandFactory } from "../command";
import Translate from "../translate";
command.register("help", "commands.help.description", "Commands", CommandPermissionLevel.NORMAL, (p, player) => {
    if (!p.page || Number(p.page) === Number(p.page)) {
        const [cmds, page, size] = CustomCommandFactory.getPlayerHelpCommands(Number(p.page));
        const text = Translate.translate("commands.help.result", [["{prefix}", command.prefix()], ["{page}", `${page}`], ["{max_page}", `${size}`], ["{commands}", cmds.join("§r\n")]]);
        player.sendMessage(text);
    }
    else {
        const cmd = command.find(p.page);
        if (!cmd)
            return Translate.sendTranslate(player, "commands.help.error");
        const params = Object.entries(cmd.parameters).map(([key, type]) => {
            const _type = (Array.isArray(type) ? type : [type, false]);
            return `<${key}${_type[1] ? "?" : ""}: ${_type[0]}>`;
        });
        const text = Translate.translate("commands.help.result.command", [["{prefix}", command.prefix()], ["{command}", cmd.name], ["{category}", cmd.category], ["{description}", Translate.translate(cmd.description)], ["{permission}", typeof cmd.permission === "string" ? cmd.permission : CommandPermissionLevel[cmd.permission]], ["{parameters}", params.join("§r\n")]]);
        player.sendMessage(text);
    }
}, {
    page: ["string", true],
}, ["h"]);
