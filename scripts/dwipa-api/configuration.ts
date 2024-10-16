import { system } from "@minecraft/server";
import Database from "./database";

namespace NusaConfiguration {

    export function register<T = any>(path: string, value: T): void {
        if (typeof getConfig(path) !== "undefined" && typeof getConfig(path) === typeof value) return;
        setConfig(path, value);
    }

    export function setConfig<T = any>(path: string, value: T): Promise<void> {
        return new Promise((resolve) => {
            system.run(async () => {
                let nusaConfig = Database.get("nusa-config") || {};
                setArray(nusaConfig, path, value);
                Database.set("nusa-config", nusaConfig);
                resolve();
            });
        });
    }
    
    export function getConfig<T = any>(path: string = ""): T|null {
        const nusaConfig = Database.get("nusa-config") || {};
        
        if (typeof nusaConfig === "undefined") return null;
        return getArray(nusaConfig, path);
    }

    function setArray(obj: any, path: string, value: any): any {
        const keys = path.split('.');
        let current = obj;

        if (path === "" || path === " ".repeat(path.length)) current=value;
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

    function getArray(obj: any, path: string): any {
        try {
            if (path === "" || path === " ".repeat(path.length)) return obj;
            else {
                const keys = path.split('.');
                let current = obj;
            
                if (path === "" || path === " ".repeat(path.length)) return current;
                for (const key of keys) {
                    if (current[key] === undefined || current[key] === null) {
                        return undefined;
                    }
                    current = current[key];
                }
            
                return current;
            }
        } catch(err) { return undefined; }
    }
}

export default NusaConfiguration;