import RegisterPlugins from "../plugins";

export interface PluginManifest {
    name: string;
    version: [number, number, number];
    description: string;
    author?: string|string[]|Record<string, string>;
    url?: string;
    license?: string;
}

const PLUGINS_PATH = "../plugins";
const plugins = new Map<string, PluginManifest>();

export namespace NusaPlugins {

    export async function start() {
        for (const pluginId of RegisterPlugins) {
            try {
                const result = await import(`${PLUGINS_PATH}/${pluginId}/index`);

                const data: PluginManifest = result.default;
            } catch(err) {
                console.warn(`[NusaPlugins] "${pluginId}" not loaded!`);
            }
        }
    }

    export function register(manifest: PluginManifest): PluginManifest {
        const plugin = plugins.get(manifest.name);
        if (plugin && compareVersions(plugin, manifest) === 1) return manifest;

        plugins.set(manifest.name.toLowerCase(), manifest);
        return manifest;
    }

    export function getPlugins(): PluginManifest[] {
        return [...plugins.values()];
    }

    export function getPlugin(name: string): PluginManifest|undefined {
        return plugins.get(name.toLowerCase());
    }

    export function compareVersions(data1: PluginManifest, data2: PluginManifest) {
        const [major1, minor1, patch1] = data1.version;
        const [major2, minor2, patch2] = data2.version;
    
        if (major1 > major2) return 1;
        if (major1 < major2) return -1;
    
        if (minor1 > minor2) return 1;
        if (minor1 < minor2) return -1;
    
        if (patch1 > patch2) return 1;
        if (patch1 < patch2) return -1;
    
        return 0;
    }
}