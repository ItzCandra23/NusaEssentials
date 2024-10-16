import { CustomForm, FormItems } from "./form-ui";
import NusaConfiguration from "./configuration";
NusaConfiguration.register("language", {
    dev_mode: false,
    v2: true,
    lang: "en-US",
});
const langs = new Map();
var Translate;
(function (Translate) {
    async function setLanguage(language, v2, dev_mode, author) {
        if (!langs.has(language)) {
            author === null || author === void 0 ? void 0 : author.sendMessage(Translate.translate("translate.error.notfound"));
            return;
        }
        if (v2 !== undefined)
            await NusaConfiguration.setConfig("language.v2", v2);
        if (dev_mode !== undefined)
            await NusaConfiguration.setConfig("language.dev_mode", dev_mode);
        await NusaConfiguration.setConfig("language.lang", language);
        author === null || author === void 0 ? void 0 : author.sendMessage(Translate.translate("translate.success.set"));
    }
    Translate.setLanguage = setLanguage;
    function setLanguageUI(player) {
        var _a, _b;
        let languagesArr = getLanguages();
        const form = new CustomForm("translate.form-ui.setlanguage.title", [
            FormItems.FormDropdown("translate.form-ui.setlanguage.contents.languages", languagesArr, languagesArr.findIndex((v) => v === getLanguage())),
            FormItems.FormToggle("translate.form-ui.setlanguage.contents.devmode", (_a = NusaConfiguration.getConfig("language.dev_mode")) !== null && _a !== void 0 ? _a : false),
            FormItems.FormToggle("translate.form-ui.setlanguage.contents.v2", (_b = NusaConfiguration.getConfig("language.v2")) !== null && _b !== void 0 ? _b : true),
        ]);
        form.sendTo(player, "translate").then((res) => {
            if (res.formValues === undefined)
                return;
            setLanguage(languagesArr[+res.formValues[0]], Boolean(res.formValues[2]), Boolean(res.formValues[1]), player);
        });
    }
    Translate.setLanguageUI = setLanguageUI;
    function isDevMode() {
        var _a;
        return (_a = NusaConfiguration.getConfig("language.dev_mode")) !== null && _a !== void 0 ? _a : false;
    }
    Translate.isDevMode = isDevMode;
    function isV2() {
        var _a;
        return (_a = NusaConfiguration.getConfig("language.v2")) !== null && _a !== void 0 ? _a : true;
    }
    Translate.isV2 = isV2;
    function getLanguage() {
        var _a;
        const lang = (_a = NusaConfiguration.getConfig("language.lang")) !== null && _a !== void 0 ? _a : "en-US";
        if (!isV2()) {
            if (langs.has(lang))
                return lang;
            else
                return [...langs.keys()][0];
        }
        else
            return lang;
    }
    Translate.getLanguage = getLanguage;
    function getLanguages() {
        return [...langs.keys()];
    }
    Translate.getLanguages = getLanguages;
    function createLanguage(language, translates, author) {
        var _a;
        if (!isV2()) {
            let data = (_a = langs.get(language)) !== null && _a !== void 0 ? _a : {};
            langs.set(language, Object.assign(Object.assign({}, translates), data));
        }
        else if (language === getLanguage()) {
            let data = langs.get("main");
            langs.set("main", Object.assign(Object.assign({}, translates), data));
        }
    }
    Translate.createLanguage = createLanguage;
    function translate(text, replace = []) {
        var _a, _b, _c;
        if (!isV2()) {
            const translate = langs.get(getLanguage());
            const devMode = (_a = NusaConfiguration.getConfig("language.dev_mode")) !== null && _a !== void 0 ? _a : false;
            if (translate && translate.hasOwnProperty(text))
                return textReplace(translate[text], replace);
            if (translate && !translate.hasOwnProperty(text) && devMode)
                return textReplace(translate[text], replace);
            if (((translate && !translate.hasOwnProperty(text)) ? true : translate === undefined) && !devMode) {
                const findtranslate = [...langs.entries()].find(([key, value]) => value.hasOwnProperty(text));
                if (findtranslate)
                    return textReplace(findtranslate[1][text], replace);
                else
                    return textReplace(text, replace);
            }
            return textReplace(text, replace);
        }
        else {
            return textReplace((_c = ((_b = langs.get("main")) !== null && _b !== void 0 ? _b : {})[text]) !== null && _c !== void 0 ? _c : text, replace);
        }
    }
    Translate.translate = translate;
    function sendTranslate(player, text, replace = []) {
        player.sendMessage(Translate.translate(text, replace));
    }
    Translate.sendTranslate = sendTranslate;
    // export async function convert(fixReplace: boolean = false): Promise<Map<string, string>> {
    //     let lang = langs.get(getLanguage()) ?? langs.get([...langs.keys()][0]) ?? {};
    //     const langObject: Map<string, string> = new Map<string, string>();
    //     if (fixReplace) await new Promise((resolve, reject) => {
    //         system.run(() => {
    //             langs.forEach((value, key) => {
    //                 if (langs.get(getLanguage()) ? getLanguage() !== key : [...langs.keys()][0] !== key) {
    //                     for (const [langKey, langValue] of Object.entries(value)) {
    //                         if (!lang.hasOwnProperty(langKey)) lang[langKey]=langValue;
    //                     }
    //                 }
    //             });
    //             resolve(true);
    //         });
    //     });
    //     await new Promise((resolve, reject) => {
    //         system.run(() => {
    //             for (const [key, value] of Object.entries(lang)) langObject.set(key, value);
    //             resolve(true);
    //         });
    //     });
    //     return langObject;
    // }
    function textReplace(text, replace) {
        if (replace.length === 0)
            return text;
        if (isArrayOfTuples(replace)) {
            replace.forEach(([v, w]) => {
                const reg = new RegExp(v, "g");
                text = text.replace(reg, w);
            });
        }
        else {
            const reg = new RegExp(replace[0], "g");
            text = text.replace(reg, replace[1]);
        }
        return text;
    }
    Translate.textReplace = textReplace;
})(Translate || (Translate = {}));
export default Translate;
function isArrayOfTuples(obj) {
    return Array.isArray(obj) && obj.every(item => Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && typeof item[1] === 'string');
}
