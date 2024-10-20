import RegisterPlugins from "../plugins";
const PLUGINS_PATH = "../plugins";
const plugins = new Map();
export var NusaPlugins;
(function (NusaPlugins) {
    async function start() {
        for (const pluginId of RegisterPlugins) {
            try {
                const result = await import(`${PLUGINS_PATH}/${pluginId}/index`);
                const data = result.default;
            }
            catch (err) {
                console.warn(`[NusaPlugins] "${pluginId}" not loaded!`);
            }
        }
    }
    NusaPlugins.start = start;
    function register(manifest) {
        const plugin = plugins.get(manifest.name);
        if (plugin && compareVersions(plugin, manifest) === 1)
            return manifest;
        plugins.set(manifest.name.toLowerCase(), manifest);
        return manifest;
    }
    NusaPlugins.register = register;
    function getPlugins() {
        return [...plugins.values()];
    }
    NusaPlugins.getPlugins = getPlugins;
    function getPlugin(name) {
        return plugins.get(name.toLowerCase());
    }
    NusaPlugins.getPlugin = getPlugin;
    function compareVersions(data1, data2) {
        const [major1, minor1, patch1] = data1.version;
        const [major2, minor2, patch2] = data2.version;
        if (major1 > major2)
            return 1;
        if (major1 < major2)
            return -1;
        if (minor1 > minor2)
            return 1;
        if (minor1 < minor2)
            return -1;
        if (patch1 > patch2)
            return 1;
        if (patch1 < patch2)
            return -1;
        return 0;
    }
    NusaPlugins.compareVersions = compareVersions;
})(NusaPlugins || (NusaPlugins = {}));
