import { system } from "@minecraft/server";
import Database from "./database";
var NusaConfiguration;
(function (NusaConfiguration) {
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
