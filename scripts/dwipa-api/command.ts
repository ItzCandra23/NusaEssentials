import { Player, system, Vector3, world } from "@minecraft/server";
import EventEmitter from "./utils/eventEmitter";
import NusaConfiguration from "./configuration";
import PlayerRank from "./playerrank";
import Translate from "./translate";
import PlayerData from "./player";

interface EventCommandParams {
    player: Player;
    params: string[];
}

export enum CommandPermissionLevel {
    NORMAL,
    ADMIN,
}

export interface CustomCommandData {
    name: string;
    description: string;
    category: string;
    permission: CommandPermissionLevel|string;
    parameters: Record<string, CommandParameters|[CommandParameters, boolean]>;
    aliases: string[];
}

export type CommandParameters = "player"|"playerid"|"string"|"number"|"boolean"|string[]|Record<string, string|number|boolean|Vector3>;

NusaConfiguration.register("command_prefix", "!");

let cmdPrefix = NusaConfiguration.getConfig("command_prefix") ?? "!";
const cmdEvent = new EventEmitter();
const commands = new Map<string, CustomCommandData>();

export const command = {

    setPrefix(prefix: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (prefix === "" || prefix.includes(" ")) reject("command.setprefix.error.invalid");

            await NusaConfiguration.setConfig("command_prefix", prefix);
            cmdPrefix = prefix;
            resolve();
        });
    },

    prefix(): string {
        return cmdPrefix;
    },

    find(cmd: string): CustomCommandData|null {
        let data = commands.get(cmd) ?? null;
        if (!data) for (const cmdData of commands.values()) if (cmdData.aliases.includes(cmd)) data = cmdData;
        return data;
    },

    register<PARAMS extends Record<string, CommandParameters|[CommandParameters, boolean]>>(name: string, description: string, category: string, permission: CommandPermissionLevel|string = CommandPermissionLevel.NORMAL, callback: (params: {
        [key in keyof PARAMS]:
        PARAMS[key] extends "number" ? number : 
        PARAMS[key] extends "player" ? Player : 
        PARAMS[key] extends "playerid" ? string : 
        PARAMS[key] extends "boolean" ? boolean : 
        PARAMS[key] extends "string" ? string : 
        PARAMS[key] extends string[] ? string : 
        PARAMS[key] extends Record<string, string> ? string : 
        PARAMS[key] extends Record<string, number> ? number : 
        PARAMS[key] extends Record<string, boolean> ? boolean : 
        PARAMS[key] extends Record<string, Vector3> ? Vector3 : 
        PARAMS[key] extends Record<string, string|number> ? string|number : 
        PARAMS[key] extends Record<string, string|boolean> ? string|boolean : 
        PARAMS[key] extends Record<string, string|Vector3> ? string|Vector3 : 
        PARAMS[key] extends Record<string, number|boolean> ? number|boolean : 
        PARAMS[key] extends Record<string, number|Vector3> ? number|Vector3 : 
        PARAMS[key] extends Record<string, boolean|Vector3> ? boolean|Vector3 : 
        PARAMS[key] extends Record<string, string|number|boolean|Vector3> ? string|number|boolean|Vector3 : 
        PARAMS[key] extends ["number", false] ? number : 
        PARAMS[key] extends ["player", false] ? Player : 
        PARAMS[key] extends ["playerid", false] ? string : 
        PARAMS[key] extends ["boolean", false] ? boolean : 
        PARAMS[key] extends ["string", false] ? string : 
        PARAMS[key] extends [string[], false] ? string : 
        PARAMS[key] extends [Record<string, string>, false] ? string : 
        PARAMS[key] extends [Record<string, number>, false] ? number : 
        PARAMS[key] extends [Record<string, boolean>, false] ? boolean : 
        PARAMS[key] extends [Record<string, Vector3>, false] ? Vector3 : 
        PARAMS[key] extends [Record<string, string|number>, false] ? string|number : 
        PARAMS[key] extends [Record<string, string|boolean>, false] ? string|boolean : 
        PARAMS[key] extends [Record<string, string|Vector3>, false] ? string|Vector3 : 
        PARAMS[key] extends [Record<string, number|boolean>, false] ? number|boolean : 
        PARAMS[key] extends [Record<string, number|Vector3>, false] ? number|Vector3 : 
        PARAMS[key] extends [Record<string, boolean|Vector3>, false] ? boolean|Vector3 : 
        PARAMS[key] extends [Record<string, string|number|boolean|Vector3>, false] ? string|number|boolean|Vector3 : 
        PARAMS[key] extends ["number", true] ? number|undefined : 
        PARAMS[key] extends ["player", true] ? Player|undefined : 
        PARAMS[key] extends ["playerid", true] ? string|undefined : 
        PARAMS[key] extends ["boolean", true] ? boolean|undefined : 
        PARAMS[key] extends ["string", true] ? string|undefined : 
        PARAMS[key] extends [string[], true] ? string|undefined : 
        PARAMS[key] extends [Record<string, string>, true] ? string|undefined : 
        PARAMS[key] extends [Record<string, number>, true] ? number|undefined : 
        PARAMS[key] extends [Record<string, boolean>, true] ? number|undefined : 
        PARAMS[key] extends [Record<string, Vector3>, true] ? Vector3|undefined : 
        PARAMS[key] extends [Record<string, string|number>, true] ? string|number|undefined : 
        PARAMS[key] extends [Record<string, string|boolean>, true] ? string|boolean|undefined : 
        PARAMS[key] extends [Record<string, string|Vector3>, true] ? string|Vector3|undefined : 
        PARAMS[key] extends [Record<string, number|boolean>, true] ? number|boolean|undefined : 
        PARAMS[key] extends [Record<string, number|Vector3>, true] ? number|Vector3|undefined : 
        PARAMS[key] extends [Record<string, boolean|Vector3>, true] ? boolean|Vector3|undefined : 
        PARAMS[key] extends [Record<string, string|number|boolean|Vector3>, true] ? string|number|boolean|Vector3|undefined : 
        string
    }, player: Player) => void, parameters: PARAMS, aliases: string[] = [], disable: boolean = false): void {
        if (disable) return;

        const _command = CustomCommandFactory.createCommand({ name, description, category, permission, aliases, parameters });
        let _parameters: Record<string, [CommandParameters, boolean]> = {};

        for (const [key, value] of Object.entries(parameters)) {
            let currentParam: any;

            if (typeof value === "object" && Array.isArray(value)) {
                if (value[1] === false || value[1] === true) {
                    _parameters[key] = value as [CommandParameters, boolean];
                    currentParam=value[0];
                }
                else {
                    _parameters[key] = [value as string[], false];
                    currentParam=value;
                }
            } else {
                _parameters[key] = [value, false];
                currentParam=value;
            }

            if (typeof currentParam === "object" && Array.isArray(currentParam) && new Set(currentParam).size < currentParam.length) throw Error(`Command<${_command.name}>: Have a same parameter!`);
            if (typeof currentParam === "object" && Array.isArray(currentParam) && currentParam.find((v) => !(/^[a-zA-Z-]+$/.test(v)))) throw Error(`Command<${_command.name}>: "${currentParam.find((v) => !(/^[a-zA-Z-]+$/.test(v)))}" Invalid parameter!`);
            if (typeof currentParam === "object" && !Array.isArray(currentParam) && Object.keys(currentParam).find((v) => !(/^[a-zA-Z-]+$/.test(v)))) throw Error(`Command<${_command.name}>: "${Object.keys(currentParam).find((v) => !(/^[a-zA-Z-]+$/.test(v)))}" Invalid parameter!`);
        }

        cmdEvent.on(`command:${_command.name}`, async (data: EventCommandParams) => {
            const player = data.player;
            let params: Record<string, Player|string|number|boolean|Vector3|undefined> = {};

            if (Object.keys(_parameters).length < Object.keys(data.params).length) {
                const err = Object.entries(data.params)[Object.keys(parameters).length];
                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                    if (typeof v === "object" && v instanceof Player) return v.name;
                    else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                    else return v;
                }).join(" ")} >>${err[1]}<<`]);
                return;
            }

            for (const [param, type] of Object.entries(_parameters)) {
                let value = data.params[Object.keys(params).length];

                if (value === undefined && type[1]) params[param]=undefined;
                else if (typeof value !== "undefined") {
                    if (type[0] === "number") {
                        let number = Number(value);
                        if (number !== number) {
                            Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                if (typeof v === "object" && v instanceof Player) return v.name;
                                else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                                else return v;
                            }).join(" ")} >>${value}<<`]);
                            return;
                        }
                        else {
                            params[param]=Number(value);
                        }
                    }
                    else {
                        if (type[0] === "player") {
                            const target = world.getAllPlayers().find((v) => v.name.toLowerCase() === value.toLowerCase());
                            if (!target) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param]=target;
                        }
                        else if (type[0] === "playerid") {
                            const targetid = PlayerData.getPlayerId(value);
                            if (!targetid) {
                                player.sendMessage(["§c", { translate: "commands.generic.noTargetMatch" }]);
                                return;
                            }
                            params[param]=targetid;
                        }
                        else if (type[0] === "boolean") {
                            const bool = (value.toLowerCase() === "true" ? true : value.toLowerCase() === "false" ? false : undefined);
                            if (bool === undefined) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                    if (typeof v === "object" && v instanceof Player) return v.name;
                                    else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                                    else return v;
                                }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param]=bool;
                        }
                        else if (typeof type[0] === "object" && Array.isArray(type[0])) {
                            const index = type[0].findIndex((v) => v.toLowerCase() === value.toLowerCase());
                            if (index < 0) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                    if (typeof v === "object" && v instanceof Player) return v.name;
                                    else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                                    else return v;
                                }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param]=type[0][index];
                        }
                        else if (typeof type[0] === "object" && !Array.isArray(type[0])) {
                            if (!type[0].hasOwnProperty(value)) {
                                Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                                    if (typeof v === "object" && v instanceof Player) return v.name;
                                    else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                                    else return v;
                                }).join(" ")} >>${value}<<`]);
                                return;
                            }
                            params[param]=type[0][value];
                        }
                        else params[param]=value;
                    }
                }
                else {
                    if (Object.values(params).length <= 1) Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + " " + Object.entries(params).map(([key, v]) => {
                        if (typeof v === "object" && v instanceof Player) return v.name;
                        else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                        else return v;
                    }).join(" ")} >><<`]);
                    else Translate.sendTranslate(player, "command.error.params", ["{error}", `${command.prefix() + _command.name + Object.entries(params).map(([key, v]) => {
                        if (typeof v === "object" && v instanceof Player) return v.name;
                        else if (typeof v === "string" && _parameters[key][0] === "playerid") return PlayerData.getPlayerName(v);
                        else return v;
                    }).join(" ")} >><<`]);
                    return;
                }
            }

            callback(params as any, player);
        });
    }
};

export namespace CustomCommandFactory {

    export function onPlayerChat(callback: (ev: {
        readonly player: Player;
        targets: Player[];
        chat: string;
        message: string;
        cancel: boolean;
    }) => void): void {
        cmdEvent.on("PlayerChat", callback);
    }

    export function getPlayerHelpCommands(page: number = 0, permissions: string[]|CommandPermissionLevel = CommandPermissionLevel.NORMAL, max_category: number = 3): [string[], number, number] {
        const groupCategory = (groupByCategory(commands.values()).map(([category, data]) => [category, (permissions === CommandPermissionLevel.ADMIN || Array.isArray(permissions) && permissions.some((perm) => perm.toUpperCase() === "ADMIN")) ? data : data.filter((v) => typeof v.permission === "number" ? (v.permission === CommandPermissionLevel.NORMAL ? true : false) : Array.isArray(permissions) ? permissions.some((perm) => perm.toLowerCase() === (v.permission as string).toLowerCase()) : false)]) as [string, CustomCommandData[]][]).filter((v) => v[1].length);
        let result: string[] = [];
        let categorySize = 0;
        let currentPage = 0;

        for (const [category, data] of groupCategory) {
            const cmds = data;

            if (cmds.length === 0) continue;
            if (categorySize === max_category) {
                result = [];
                categorySize = 0;
            }
            categorySize++;

            result.push(Translate.translate("commands.help.result.category", ["{category}", category]));
            for (const cmd of cmds) {
                const params = Object.entries(cmd.parameters).map(([key, type]) => {
                    const _type = (Array.isArray(type) ? type : [type, false]) as [CommandParameters, boolean];
                    return `<${key}${_type[1] ? "?" : ""}: ${_type[0]}>`;
                });

                result.push(...[
                    Translate.translate("commands.help.result.commandline", [["{prefix}", command.prefix()], ["{command}", cmd.name], ["{parameters}", params.join(" ")], ["{description}", Translate.translate(cmd.description)]]),
                    ...cmd.aliases.map((alias) => Translate.translate("commands.help.result.commandline", [["{prefix}", command.prefix()], ["{command}", alias], ["{parameters}", params.join(" ")], ["{description}", Translate.translate(cmd.description)]])),
                ]);
            }
            
            if (categorySize === max_category) currentPage++;
            if (page > 0 && currentPage === page) break;
        }

        return [result, currentPage <= 0 ? 1 : currentPage, groupCategory.length];
    }

    export function getPlayerCommandPermission(player: Player): CommandPermissionLevel {
        if (PlayerRank.isAdmin(player)) return CommandPermissionLevel.ADMIN;
        else return CommandPermissionLevel.NORMAL;
    }

    export function hasPermission(player: Player, permission: CommandPermissionLevel|string): boolean {
        if (permission === CommandPermissionLevel.NORMAL) return true;
        if (PlayerRank.isAdmin(player)) return true;
        if (typeof permission === "string" && PlayerRank.hasPermission(player, permission)) return true;
        return false;
    }

    export function emitCommand(player: Player, text: string): void {
        if (text.startsWith(command.prefix())) text = text.substring(command.prefix().length);

        const regex = /("[^"]*"|{[^}]*}|\b\d+(\.\d+)?\b|\b\w+\b)/g;
        let result = text.match(regex)?.map(match => match.replace(/"/g, ''));

        if (!result) return player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [ command.prefix() ] }]);

        const cmd = result[0];
        let data = commands.get(cmd);

        if (!data) for (const cmdData of commands.values()) if (cmdData.aliases.includes(cmd)) data = cmdData;
        if (!data || !hasPermission(player, data.permission)) return player.sendMessage(["§c", { translate: "commands.generic.unknown", with: [ command.prefix()+cmd ] }]);

        let emitData: EventCommandParams = {
            player,
            params: result.slice(1),
        };

        cmdEvent.emit(`command:${data.name}`, emitData);
    }

    export function createCommand(data: CustomCommandData): CustomCommandData {
        const cmdRegex = /^[a-z]+$/;
        const permRegex = /^[a-zA-Z0-9._-]+$/;
        
        if (!cmdRegex.test(data.name)) throw Error(`Command: "${data.name}" Invalid command name!`);
        if (commands.has(data.name)) throw Error(`Command: "${data.name}" Already registered!`);
        if (typeof data.permission === "string" && !permRegex.test(data.permission)) throw Error(`Command<${data.name}>: "${data.permission}" Invalid Permission!`);

        data.aliases = [...new Set(data.aliases)];

        for (const alias of data.aliases) {
            if (!cmdRegex.test(alias)) throw Error(`Command<${data.name}>: "${alias}" Invalid command alias!`);
            if (commands.has(alias)) throw Error(`Command<${data.name}>: "${alias}" Alias already registered!`);
        }

        for (const [ _key, _data ] of commands.entries()) {
            const someAlias = _data.aliases.find((v) => data.aliases.includes(v));
            if (_data.aliases.includes(data.name)) throw Error(`Command: "${data.name}" Already registered!`);
            if (someAlias) throw Error(`Command<${data.name}>: "${someAlias}" Alias already registered!`);
        }

        commands.set(data.name, data);
        return data;
    }
}

world.beforeEvents.chatSend.subscribe((ev) => {
    let msg = ev.message;
    const player = ev.sender;
    const rank_chat = NusaConfiguration.getConfig("rank.rank_chat") ?? true;

    if (rank_chat) ev.cancel = true;
    else if (msg.startsWith(command.prefix()) || player.hasTag("mute") || msg.startsWith(".clan")) ev.cancel = true;

    system.run(async () => {
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

        try { await cmdEvent.emit("PlayerChat", data); } catch(err) {}
        if (rank_chat) data.chat = PlayerRank.getFormatChat(player.id, data.message, data.chat) ?? data.chat;

        if (data.cancel) return;
        if (data.message === "" || data.message === " ".repeat(data.message.length) || (data.message.match(/§/g) || []).length * 2 === data.message.length) return;

        try {
            for (const target of data.targets) target.sendMessage(data.chat);
            console.log(textFilter(data.chat));
        } catch(err) {}
    });
});

system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (!data.id.startsWith("nusa:run")) return;
    const name = data.id.split("_")[1];
    const target = name ? (world.getPlayers({ name })[0] || undefined) : data.initiator;

    if (target instanceof Player) CustomCommandFactory.emitCommand(target, data.message);
});

function textFilter(text: string): string {
    return text.split("§").map((v, i) => { if (i === 0) return v; else return v.slice(1)}).join().replace(/,/g, "");
}

function groupByCategory(commands: IterableIterator<CustomCommandData>): [string, CustomCommandData[]][] {
    const grouped = Array.from(commands).reduce((acc, command) => {
        const index = acc.findIndex(([category]) => category === command.category);
        if (index !== -1) acc[index][1].push(command);
        else acc.push([command.category, [command]]);
        return acc;
    }, [] as [string, CustomCommandData[]][]);

    return grouped;
}