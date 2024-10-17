var _a;
import { Player, system, world } from "@minecraft/server";
import EventEmitter from "./utils/eventEmitter";
import NusaConfiguration from "./configuration";
import PlayerRank from "./playerrank";
import Translate from "./translate";
import PlayerData from "./player";
export var CommandPermissionLevel;
(function (CommandPermissionLevel) {
    CommandPermissionLevel[CommandPermissionLevel["NORMAL"] = 0] = "NORMAL";
    CommandPermissionLevel[CommandPermissionLevel["ADMIN"] = 1] = "ADMIN";
})(CommandPermissionLevel || (CommandPermissionLevel = {}));
NusaConfiguration.register("command_prefix", "!");
let cmdPrefix = (_a = NusaConfiguration.getConfig("command_prefix")) !== null && _a !== void 0 ? _a : "!";
const cmdEvent = new EventEmitter();
const commands = new Map();
export const command = {
    setPrefix(prefix) {
        return new Promise(async (resolve, reject) => {
            if (prefix === "" || prefix.includes(" "))
                reject("command.setprefix.error.invalid");
            await NusaConfiguration.setConfig("command_prefix", prefix);
            cmdPrefix = prefix;
            resolve();
        });
    },
    prefix() {
        return cmdPrefix;
    },
    find(cmd) {
        var _a;
        let data = (_a = commands.get(cmd)) !== null && _a !== void 0 ? _a : null;
        if (!data)
            for (const cmdData of commands.values())
                if (cmdData.aliases.includes(cmd))
                    data = cmdData;
        return data;
    },
    register(name, description, category, permission = CommandPermissionLevel.NORMAL, callback, parameters, aliases = [], disable = false) {
        if (disable)
            return;
        const _command = CustomCommandFactory.createCommand({ name, description, category, permission, aliases, parameters });
        let _parameters = {};
        for (const [key, value] of Object.entries(parameters)) {
            let currentParam;
            if (typeof value === "object" && Array.isArray(value)) {
                if (value[1] === false || value[1] === true) {
                    _parameters[key] = value;
                    currentParam = value[0];
                }
                else {
                    _parameters[key] = [value, false];
                    currentParam = value;
                }
            }
            else {
                _parameters[key] = [value, false];
                currentParam = value;
            }
            if (typeof currentParam === "object" && Array.isArray(currentParam) && new Set(currentParam).size < currentParam.length)
                throw Error(`Command<${_command.name}>: Have a same parameter!`);
            if (typeof currentParam === "object" && Array.isArray(currentParam) && currentParam.find((v) => !(/^[a-zA-Z-]+$/.test(v))))
                throw Error(`Command<${_command.name}>: "${currentParam.find((v) => !(/^[a-zA-Z-]+$/.test(v)))}" Invalid parameter!`);
            if (typeof currentParam === "object" && !Array.isArray(currentParam) && Object.keys(currentParam).find((v) => !(/^[a-zA-Z-]+$/.test(v))))
                throw Error(`Command<${_command.name}>: "${Object.keys(currentParam).find((v) => !(/^[a-zA-Z-]+$/.test(v)))}" Invalid parameter!`);
        }
        cmdEvent.on(`command:${_command.name}`, async (data) => {
            const player = data.player;
            let params = {};
            if (Object.keys(_parameters).length < Object.keys(data.params).length) {
                const err = Object.entries(data.params)[Object.keys(parameters).length];
                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                        if (typeof v === "object" && v instanceof Player)
                            return v.name;
                        else if (typeof v === "string" && _parameters[key][0] === "playerid")
                            return PlayerData.getPlayerName(v);
                        else
                            return v;
                    }).join(" ")} >>${err[1]}<<`]);
                return;
            }
            for (const [param, type] of Object.entries(_parameters)) {
                let value = data.params[Object.keys(params).length];
                if (value === undefined && type[1])
                    params[param] = undefined;
                else if (typeof value !== "undefined") {
                    if (type[0] === "number") {
                        let number = Number(value);
                        if (number !== number) {
                            Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                    if (typeof v === "object" && v instanceof Player)
                                        return v.name;
                                    else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                        return PlayerData.getPlayerName(v);
                                    else
                                        return v;
                                }).join(" ")} >>${value}<<`]);
                            return;
                        }
                        else {
                            params[param] = Number(value);
                        }
                    }
                    else {
                        if (type[0] === "player") {
                            const target = world.getAllPlayers().find((v) => v.name.toLowerCase() === value.toLowerCase());
                            if (!target) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param] = target;
                        }
                        else if (type[0] === "playerid") {
                            const targetid = PlayerData.getPlayerId(value);
                            if (!targetid) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param] = targetid;
                        }
                        else if (type[0] === "boolean") {
                            const bool = (value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : undefined);
                            if (bool === undefined) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                        if (typeof v === "object" && v instanceof Player)
                                            return v.name;
                                        else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                            return PlayerData.getPlayerName(v);
                                        else
                                            return v;
                                    }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param] = bool;
                        }
                        else if (typeof type[0] === "object" && Array.isArray(type[0])) {
                            const index = type[0].findIndex((v) => v.toLowerCase() === value.toLowerCase());
                            if (index < 0) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                        if (typeof v === "object" && v instanceof Player)
                                            return v.name;
                                        else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                            return PlayerData.getPlayerName(v);
                                        else
                                            return v;
                                    }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param] = type[0][index];
                        }
                        else if (typeof type[0] === "object" && !Array.isArray(type[0])) {
                            if (!type[0].hasOwnProperty(value)) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                        if (typeof v === "object" && v instanceof Player)
                                            return v.name;
                                        else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                            return PlayerData.getPlayerName(v);
                                        else
                                            return v;
                                    }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param] = type[0][value];
                        }
                        else
                            params[param] = value;
                    }
                }
                else {
                    if (Object.values(params).length <= 1)
                        Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                if (typeof v === "object" && v instanceof Player)
                                    return v.name;
                                else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                    return PlayerData.getPlayerName(v);
                                else
                                    return v;
                            }).join(" ")} >><<`]);
                    else
                        Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + Object.entries(params).map(([key, v]) => {
                                if (typeof v === "object" && v instanceof Player)
                                    return v.name;
                                else if (typeof v === "string" && _parameters[key][0] === "playerid")
                                    return PlayerData.getPlayerName(v);
                                else
                                    return v;
                            }).join(" ")} >><<`]);
                    return;
                }
            }
            callback(params, player);
        });
    }
};
export var CustomCommandFactory;
(function (CustomCommandFactory) {
    function onPlayerChat(callback) {
        cmdEvent.on("PlayerChat", callback);
    }
    CustomCommandFactory.onPlayerChat = onPlayerChat;
    function getPlayerHelpCommands(page = 0, permissions = CommandPermissionLevel.NORMAL, max_category = 3) {
        const groupCategory = groupByCategory(commands.values()).map(([category, data]) => [category, (permissions === CommandPermissionLevel.ADMIN || Array.isArray(permissions) && permissions.some((perm) => perm.toUpperCase() === "ADMIN")) ? data : data.filter((v) => typeof v.permission === "number" ? (v.permission === CommandPermissionLevel.NORMAL ? true : false) : Array.isArray(permissions) ? permissions.some((perm) => perm.toLowerCase() === v.permission.toLowerCase()) : false)]).filter((v) => v[1].length);
        let result = [];
        let categorySize = 0;
        let currentPage = 0;
        for (const [category, data] of groupCategory) {
            const cmds = data;
            if (cmds.length === 0)
                continue;
            if (categorySize === max_category) {
                result = [];
                categorySize = 0;
            }
            categorySize++;
            result.push(Translate.translate("commands.help.result.category", ["{category}", category]));
            for (const cmd of cmds) {
                const params = Object.entries(cmd.parameters).map(([key, type]) => {
                    const _type = (Array.isArray(type) ? type : [type, false]);
                    return `<${key}${_type[1] ? "?" : ""}: ${_type[0]}>`;
                });
                result.push(...[
                    Translate.translate("commands.help.result.commandline", [["{prefix}", command.prefix()], ["{command}", cmd.name], ["{parameters}", params.join(" ")], ["{description}", Translate.translate(cmd.description)]]),
                    ...cmd.aliases.map((alias) => Translate.translate("commands.help.result.commandline", [["{prefix}", command.prefix()], ["{command}", alias], ["{parameters}", params.join(" ")], ["{description}", Translate.translate(cmd.description)]])),
                ]);
            }
            if (categorySize === max_category)
                currentPage++;
            if (page > 0 && currentPage === page)
                break;
        }
        return [result, currentPage <= 0 ? 1 : currentPage, groupCategory.length];
    }
    CustomCommandFactory.getPlayerHelpCommands = getPlayerHelpCommands;
    function getPlayerCommandPermission(player) {
        if (PlayerRank.isAdmin(player))
            return CommandPermissionLevel.ADMIN;
        else
            return CommandPermissionLevel.NORMAL;
    }
    CustomCommandFactory.getPlayerCommandPermission = getPlayerCommandPermission;
    function hasPermission(player, permission) {
        if (permission === CommandPermissionLevel.NORMAL)
            return true;
        if (PlayerRank.isAdmin(player))
            return true;
        if (typeof permission === "string" && PlayerRank.hasPermission(player, permission))
            return true;
        return false;
    }
    CustomCommandFactory.hasPermission = hasPermission;
    function emitCommand(player, text) {
        var _a;
        if (text.startsWith(command.prefix()))
            text = text.substring(command.prefix().length);
        const regex = /("[^"]*"|{[^}]*}|\b\d+(\.\d+)?\b|\b\w+\b)/g;
        let result = (_a = text.match(regex)) === null || _a === void 0 ? void 0 : _a.map(match => match.replace(/"/g, ''));
        if (!result)
            return player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [command.prefix()] }]);
        const cmd = result[0];
        let data = commands.get(cmd);
        if (!data)
            for (const cmdData of commands.values())
                if (cmdData.aliases.includes(cmd))
                    data = cmdData;
        if (!data || !hasPermission(player, data.permission))
            return player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [command.prefix() + cmd] }]);
        let emitData = {
            player,
            params: result.slice(1),
        };
        cmdEvent.emit(`command:${data.name}`, emitData);
    }
    CustomCommandFactory.emitCommand = emitCommand;
    function createCommand(data) {
        const cmdRegex = /^[a-z]+$/;
        const permRegex = /^[a-zA-Z0-9._-]+$/;
        if (!cmdRegex.test(data.name))
            throw Error(`Command: "${data.name}" Invalid command name!`);
        if (commands.has(data.name))
            throw Error(`Command: "${data.name}" Already registered!`);
        if (typeof data.permission === "string" && !permRegex.test(data.permission))
            throw Error(`Command<${data.name}>: "${data.permission}" Invalid Permission!`);
        data.aliases = [...new Set(data.aliases)];
        for (const alias of data.aliases) {
            if (!cmdRegex.test(alias))
                throw Error(`Command<${data.name}>: "${alias}" Invalid command alias!`);
            if (commands.has(alias))
                throw Error(`Command<${data.name}>: "${alias}" Alias already registered!`);
        }
        for (const [_key, _data] of commands.entries()) {
            const someAlias = _data.aliases.find((v) => data.aliases.includes(v));
            if (_data.aliases.includes(data.name))
                throw Error(`Command: "${data.name}" Already registered!`);
            if (someAlias)
                throw Error(`Command<${data.name}>: "${someAlias}" Alias already registered!`);
        }
        commands.set(data.name, data);
        return data;
    }
    CustomCommandFactory.createCommand = createCommand;
})(CustomCommandFactory || (CustomCommandFactory = {}));
world.beforeEvents.chatSend.subscribe((ev) => {
    var _a;
    let msg = ev.message;
    const player = ev.sender;
    const rank_chat = (_a = NusaConfiguration.getConfig("rank.rank_chat")) !== null && _a !== void 0 ? _a : true;
    if (rank_chat)
        ev.cancel = true;
    else if (msg.startsWith(command.prefix()) || player.hasTag("mute") || msg.startsWith(".clan"))
        ev.cancel = true;
    system.run(async () => {
        var _a;
        if (msg.startsWith(command.prefix())) {
            CustomCommandFactory.emitCommand(player, msg);
            return;
        }
        if (player.hasTag("mute")) {
            player.sendMessage(Translate.translate("chat.muted"));
            return;
        }
        const rank = PlayerRank.getRank(player.id);
        let data = {
            player,
            chat: rank.getFormatChat(),
            message: msg,
            targets: world.getAllPlayers(),
            cancel: false,
        };
        try {
            await cmdEvent.emit("PlayerChat", data);
        }
        catch (err) { }
        if (rank_chat)
            data.chat = (_a = PlayerRank.getFormatChat(player.id, data.message, data.chat)) !== null && _a !== void 0 ? _a : data.chat;
        if (data.cancel)
            return;
        if (data.message === "" || data.message === " ".repeat(data.message.length) || (data.message.match(/§/g) || []).length * 2 === data.message.length)
            return;
        try {
            for (const target of data.targets)
                target.sendMessage(data.chat);
            console.log(textFilter(data.chat));
        }
        catch (err) { }
    });
});
system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (!data.id.startsWith("nusa:run"))
        return;
    const name = data.id.split("_")[1];
    const target = name ? (world.getPlayers({ name })[0] || undefined) : data.initiator;
    if (target instanceof Player)
        CustomCommandFactory.emitCommand(target, data.message);
});
function textFilter(text) {
    return text.split("§").map((v, i) => { if (i === 0)
        return v;
    else
        return v.slice(1); }).join().replace(/,/g, "");
}
function groupByCategory(commands) {
    const grouped = Array.from(commands).reduce((acc, command) => {
        const index = acc.findIndex(([category]) => category === command.category);
        if (index !== -1)
            acc[index][1].push(command);
        else
            acc.push([command.category, [command]]);
        return acc;
    }, []);
    return grouped;
}
