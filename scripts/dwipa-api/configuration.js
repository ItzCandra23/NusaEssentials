import { system } from "@minecraft/server";
import Database from "./database";
import PlayerRank from "./playerrank";
import { CustomForm, FormItems, SimpleForm } from "./form-ui";
import Translate from "./translate";
import { CommandPermissionLevel } from "./command";
var NusaConfiguration;
(function (NusaConfiguration) {
    function setConfigUI(player, path = "") {
        const array = getArray(getConfig(), path);
        if (typeof array === "object" || typeof array === "undefined") {
            if (!PlayerRank.isAdmin(player))
                return;
            const form = new SimpleForm("config.form-ui.setconfig.title");
            let keys = [];
            if (typeof array === "undefined") {
                form.setContent(Translate.translate("config.form-ui.setconfig.description", [["{data}", (JSON.stringify(getConfig(), undefined, 4)).replace(/"/g, `§r§a"`)], ["{path}", "config"], ["{type}", typeof array]]));
                keys = Object.keys(getConfig() || {});
            }
            else {
                form.setContent(Translate.translate("config.form-ui.setconfig.description", [["{data}", (JSON.stringify(array, undefined, 4)).replace(/"/g, `§r§a"`)], ["{path}", path], ["{type}", typeof array]]));
                keys = Object.keys(array);
            }
            for (const key of keys) {
                let newpath = path.split(".");
                newpath.push(key);
                let _newpath = newpath.join(".");
                if (_newpath.startsWith("."))
                    _newpath = _newpath.substring(1);
                if (_newpath.endsWith("."))
                    _newpath = _newpath.substring(0, _newpath.length - 2);
                const value = getArray(getConfig(), _newpath);
                form.addButton(FormItems.FormButton(`§d${key}§r\n${typeof value}`));
            }
            form.addButton(FormItems.FormButton("form-ui.buttons.back", `textures/blocks/barrier.png`));
            form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
                if (res.selection === undefined)
                    return;
                let newpath = path.split(".");
                if (res.selection === keys.length) {
                    if (path === "")
                        return;
                    newpath.pop();
                    let _newpath = newpath.join(".");
                    if (_newpath.startsWith("."))
                        _newpath = _newpath.substring(1);
                    if (_newpath.endsWith("."))
                        _newpath = _newpath.substring(0, _newpath.length - 2);
                    setConfigUI(player, _newpath);
                    return;
                }
                newpath.push(keys[res.selection]);
                let _newpath = newpath.join(".");
                if (_newpath.startsWith("."))
                    _newpath = _newpath.substring(1);
                if (_newpath.endsWith("."))
                    _newpath = _newpath.substring(0, _newpath.length - 2);
                setConfigUI(player, _newpath);
            });
        }
        else if (typeof array === "number") {
            if (!PlayerRank.isAdmin(player))
                return;
            const form = new CustomForm("config.form-ui.setconfig.title", [
                FormItems.FormInput(Translate.translate("config.form-ui.setconfig.description", [["{data}", array.toString()], ["{path}", path], ["{type}", typeof array]]), array.toString()),
            ]);
            form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
                if (res.canceled || res.formValues === undefined)
                    return;
                if (Number.isNaN(res.formValues[0])) {
                    player.sendMessage(Translate.translate("config.error.value"));
                    return;
                }
                player.sendMessage(Translate.translate("config.success.set"));
                setConfig(path, Number(res.formValues[0]));
            });
        }
        else if (typeof array === "boolean") {
            if (!PlayerRank.hasPermission(player, "admin"))
                return;
            const form = new CustomForm("config.form-ui.setconfig.title", [
                FormItems.FormToggle(Translate.translate("config.form-ui.setconfig.description", [["{data}", `${array}`], ["{path}", path], ["{type}", typeof array]]), array),
            ]);
            form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
                if (res.canceled || res.formValues === undefined)
                    return;
                player.sendMessage(Translate.translate("config.success.set"));
                setConfig(path, res.formValues[0]);
            });
        }
        else if (typeof array === "string") {
            if (!PlayerRank.isAdmin(player))
                return;
            const form = new CustomForm("config.form-ui.setconfig.title", [
                FormItems.FormInput(Translate.translate("config.form-ui.setconfig.description", [["{data}", array], ["{path}", path], ["{type}", typeof array]]), array),
            ]);
            form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
                if (res.formValues === undefined)
                    return;
                if (res.formValues[0] === "") {
                    player.sendMessage(Translate.translate("config.error.value"));
                    return;
                }
                player.sendMessage(Translate.translate("config.success.set"));
                setConfig(path, res.formValues[0].toString().replace(/\\n/g, "\n"));
            });
        }
    }
    NusaConfiguration.setConfigUI = setConfigUI;
    function register(path, value) {
        if (typeof getConfig(path) !== "undefined" && typeof getConfig(path) === typeof value)
            return;
        setConfig(path, value);
    }
    NusaConfiguration.register = register;
    function setConfig(path, value) {
        return new Promise((resolve) => {
            system.run(async () => {
                let nusaConfig = Database.get("nusa-config") || {};
                setArray(nusaConfig, path, value);
                Database.set("nusa-config", nusaConfig);
                resolve();
            });
        });
    }
    NusaConfiguration.setConfig = setConfig;
    function getConfig(path = "") {
        const nusaConfig = Database.get("nusa-config") || {};
        if (typeof nusaConfig === "undefined")
            return null;
        return getArray(nusaConfig, path);
    }
    NusaConfiguration.getConfig = getConfig;
    function setArray(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        if (path === "" || path === " ".repeat(path.length))
            current = value;
        else {
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }
            const lastKey = keys[keys.length - 1];
            current[lastKey] = value;
        }
        return current;
    }
    function getArray(obj, path) {
        try {
            if (path === "" || path === " ".repeat(path.length))
                return obj;
            else {
                const keys = path.split('.');
                let current = obj;
                if (path === "" || path === " ".repeat(path.length))
                    return current;
                for (const key of keys) {
                    if (current[key] === undefined || current[key] === null) {
                        return undefined;
                    }
                    current = current[key];
                }
                return current;
            }
        }
        catch (err) {
            return undefined;
        }
    }
})(NusaConfiguration || (NusaConfiguration = {}));
export default NusaConfiguration;
