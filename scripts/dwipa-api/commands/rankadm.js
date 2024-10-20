import { command, CommandPermissionLevel } from "../command";
import PlayerData from "../player";
import PlayerRank from "../playerrank";
import RankPermsUI from "../rank-ui";
import RankPerms from "../rankpermissions";
import Translate from "../translate";
const RankAdminAction = [
    "help",
    "createrank",
    "deleterank",
    "renamerank",
    "setdefault",
    "listrank",
    "setdisplay",
    "editchat",
    "editnametag",
    "listpermissions",
    "addperm",
    "delperm",
    "addinheritance",
    "setrank",
];
command.register("rankadm", "commands.rankadm.description", "RankPerms", CommandPermissionLevel.ADMIN, (p, player) => {
    var _a, _b, _c;
    const action = p.action;
    if (!action)
        return RankPermsUI.main(player);
    if (action === "createrank") {
        if (!p.value1)
            return RankPermsUI.createRank(player);
        RankPerms.createRank(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.createrank"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "deleterank") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        RankPerms.deleteRank(p.value1)
            .then(() => Translate.sendTranslate(player, "rankperms.success.deleterank"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "renamerank") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.renameRank(player, p.value1);
        RankPerms.renameRank(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.renamerank"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "setdefault") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        RankPerms.setDefault(p.value1)
            .then(() => Translate.sendTranslate(player, "rankperms.success.setdefault"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "listrank") {
        const ranks = Object.entries(RankPerms.getRawRanks());
        const text = Translate.translate("commands.rankadm.result.listrank", [["{length}", `${ranks.length}`], ["{ranks}", ranks.map(([rankId, data]) => Translate.translate("commands.rankadm.result.listrank.rank", [["{display}", data.display], ["{rank}", rankId]])).join("")]]);
        player.sendMessage(text);
        return;
    }
    if (action === "setdisplay") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.setDisplay(player, p.value1);
        RankPerms.setDisplay(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.setdisplay"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "editchat") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.setFormatChat(player, p.value1);
        RankPerms.setFormatChat(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.setformat"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "editnametag") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.setFormatName(player, p.value1);
        RankPerms.setFormatNameTag(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.setformat"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "listpermissions") {
        const rank = RankPerms.getRank((_a = p.value1) !== null && _a !== void 0 ? _a : "");
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        const permissions = rank.getPermissions();
        const text = Translate.translate("commands.rankadm.result.listpermissions", [["{rank}", `${rank.getRankId()}`], ["{display}", `${rank.getDisplay()}`], ["{length}", `${permissions.length}`], ["{permissions}", permissions.map((permission) => Translate.translate("commands.rankadm.result.listpermissions.permission", ["{permission}", permission])).join("")]]);
        player.sendMessage(text);
        return;
    }
    if (action === "addperm") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.addPermission(player, p.value1);
        RankPerms.addPermission(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.addpermission"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "delperm") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        RankPerms.removePermission(p.value1, (_b = p.value2) !== null && _b !== void 0 ? _b : "")
            .then(() => Translate.sendTranslate(player, "rankperms.success.removepermission"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "addinheritance") {
        if (!p.value1)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!p.value2)
            return RankPermsUI.addInheritance(player, p.value1);
        RankPerms.addInheritance(p.value1, p.value2)
            .then(() => Translate.sendTranslate(player, "rankperms.success.addinheritance"))
            .catch((err) => Translate.sendTranslate(player, err));
        return;
    }
    if (action === "setrank") {
        const playerId = PlayerData.getPlayerId((_c = p.value1) !== null && _c !== void 0 ? _c : "");
        if (!playerId)
            return Translate.sendTranslate(player, "playerrank.error.notfound.player");
        if (!p.value2)
            return Translate.sendTranslate(player, "playerrank.error.notfound.rank");
        PlayerRank.setPlayer(playerId, p.value2)
            .then(() => Translate.sendTranslate(player, "playerrank.success.setplayerrank"))
            .catch((err) => Translate.sendTranslate(player, err));
    }
}, {
    action: [[...RankAdminAction], true],
    value1: ["string", true],
    value2: ["string", true],
}, ["ra"]);
