import { CustomForm, FormItems, ModalForm, SimpleForm } from "./form-ui";
import { CommandPermissionLevel } from "./command";
import RankPerms from "./rankpermissions";
import Translate from "./translate";
var RankPermsUI;
(function (RankPermsUI) {
    function main(player, callback) {
        const ranks = Object.entries(RankPerms.getRawRanks());
        const form = new SimpleForm("rankperms.form-ui.main.title", "rankperms.form-ui.main.description", [
            ...ranks.map(([rankId, data]) => FormItems.FormButton(Translate.translate("rankperms.form-ui.main.buttons.rank", [["{rank}", rankId], ["{display}", data.display]]))),
            FormItems.FormButton("rankperms.form-ui.main.buttons.createrank", "textures/ui/Add-Ons_Nav_Icon36x36.png"),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close", "textures/blocks/barrier.png"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined)
                return;
            if (res.selection === ranks.length + 1)
                return callback ? callback() : null;
            if (res.selection === ranks.length)
                return createRank(player, (r) => r ? main(player) : true);
            editRank(player, ranks[res.selection][0], () => main(player));
        });
    }
    RankPermsUI.main = main;
    function createRank(player, callback) {
        const form = new CustomForm("rankperms.form-ui.createrank.title", [
            FormItems.FormInput("rankperms.form-ui.createrank.contents.rankid", "rankperms.form-ui.createrank.contents.rankid.placeholder"),
            FormItems.FormInput("rankperms.form-ui.createrank.contents.display", "rankperms.form-ui.createrank.contents.display.placeholder"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            const rankid = res.formValues[0];
            const display = res.formValues[1];
            RankPerms.createRank(rankid, display)
                .then(() => callback && callback(true) ? Translate.sendTranslate(player, "rankperms.success.createrank") : null)
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.createRank = createRank;
    function deleteRankConfirm(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const permissions = rank.getPermissions().map((perm) => Translate.translate("rankperms.form-ui.deleterank.description.permission", ["{permission}", perm]));
        const form = new ModalForm(Translate.translate("rankperms.form-ui.deleterank.title", ["{rank}", rankId]), Translate.translate("rankperms.form-ui.deleterank.description", [
            ["{rank}", rankId],
            ["{default}", `${rank.isDefault()}`],
            ["{display}", rank.getDisplay()],
            ["{format_chat}", rank.getFormatChat()],
            ["{format_name}", rank.getFormatNameTag()],
            ["{permissions}", permissions.join("")],
        ]));
        form.setButtonConfirm("form-ui.buttons.confirm");
        form.setButtonCancel("form-ui.buttons.cancel");
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (!res.selection)
                return;
            RankPerms.deleteRank(rankId)
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.deleterank"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.deleteRankConfirm = deleteRankConfirm;
    function editRank(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const permissions = rank.getPermissions().map((perm) => Translate.translate("rankperms.form-ui.editrank.description.permission", ["{permission}", perm]));
        const form = new SimpleForm(Translate.translate("rankperms.form-ui.editrank.title", ["{rank}", rankId]), Translate.translate("rankperms.form-ui.editrank.description", [
            ["{rank}", rankId],
            ["{default}", `${rank.isDefault()}`],
            ["{display}", rank.getDisplay()],
            ["{format_chat}", rank.getFormatChat()],
            ["{format_name}", rank.getFormatNameTag()],
            ["{permissions}", permissions.join("")],
        ]), [
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.rename", "textures/ui/editIcon.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setdefault", "textures/ui/free_download_symbol.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.moveup", "textures/ui/up_arrow.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.movedown", "textures/ui/down_arrow.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setdisplay", "textures/ui/book_metatag_default.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.permissions", "textures/ui/accessibility_glyph_color.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.addinheritance", "textures/ui/Add-Ons_8x8.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setformatchat", "textures/ui/Feedback.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setformatname", "textures/ui/Feedback.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.deleterank", "textures/ui/icon_trash.png"),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close", "textures/blocks/barrier.png"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined)
                return;
            if (res.selection === 10 && callback)
                return callback();
            if (res.selection === 0)
                return renameRank(player, rankId, (r, rankId) => r ? editRank(player, rankId, callback) : true);
            if (res.selection === 1)
                return rank.setDefault().then(() => editRank(player, rankId, callback)).catch((err) => typeof err === "string" ? Translate.sendTranslate(player, err) : null);
            if (res.selection === 2)
                return rank.moveRank("up").then(() => editRank(player, rankId, callback)).catch((err) => typeof err === "string" ? Translate.sendTranslate(player, err) : null);
            if (res.selection === 3)
                return rank.moveRank("down").then(() => editRank(player, rankId, callback)).catch((err) => typeof err === "string" ? Translate.sendTranslate(player, err) : null);
            if (res.selection === 4)
                return setDisplay(player, rankId, (r) => r ? editRank(player, rankId, callback) : true);
            if (res.selection === 5)
                return editPermissions(player, rankId, () => editRank(player, rankId, callback));
            if (res.selection === 6)
                return addInheritance(player, rankId, (r) => r ? editRank(player, rankId, callback) : true);
            if (res.selection === 7)
                return setFormatChat(player, rankId, (r) => r ? editRank(player, rankId, callback) : true);
            if (res.selection === 8)
                return setFormatName(player, rankId, (r) => r ? editRank(player, rankId, callback) : true);
            if (res.selection === 9)
                return deleteRankConfirm(player, rankId, (r) => r ? callback ? callback() : true : true);
        });
    }
    RankPermsUI.editRank = editRank;
    function renameRank(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.renamerank.title", ["{rank}", rankId]), [
            FormItems.FormInput("rankperms.form-ui.renamerank.contents.rankid", "rankperms.form-ui.renamerank.contents.rankid.placeholder", rankId),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.renameRank(res.formValues[0])
                .then(() => callback ? callback(true, rank.getRankId()) : Translate.sendTranslate(player, "rankperms.success.renamerank"))
                .catch((err) => typeof err === "string" ? callback && callback(false, rankId) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.renameRank = renameRank;
    function setDisplay(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.setdisplay.title", ["{rank}", rankId]), [
            FormItems.FormInput("rankperms.form-ui.setdisplay.contents.display", "rankperms.form-ui.setdisplay.contents.display.placeholder", rank.getDisplay()),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.setDisplay(res.formValues[0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.setdisplay"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.setDisplay = setDisplay;
    function setFormatChat(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.setformatchat.title", ["{rank}", rankId]), [
            FormItems.FormInput("rankperms.form-ui.setformatchat.contents.format", "rankperms.form-ui.setformatchat.contents.format.placeholder", rank.getFormatChat()),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.setFormatChat(res.formValues[0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.setformat"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.setFormatChat = setFormatChat;
    function setFormatName(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.setformatname.title", ["{rank}", rankId]), [
            FormItems.FormInput("rankperms.form-ui.setformatname.contents.format", "rankperms.form-ui.setformatname.contents.format.placeholder", rank.getFormatNameTag()),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.setFormatNameTag(res.formValues[0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.setformat"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.setFormatName = setFormatName;
    function addInheritance(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const ranks = Object.entries(RankPerms.getRawRanks()).filter((v) => v[0] !== rankId);
        const form = new SimpleForm(Translate.translate("rankperms.form-ui.addinheritance.title", ["{rank}", rankId]), "rankperms.form-ui.addinheritance.description", [
            ...ranks.map(([_rankId, data]) => FormItems.FormButton(Translate.translate("rankperms.form-ui.addinheritance.buttons.rank", [["{display}", data.display], ["{rank}", _rankId]]))),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined)
                return;
            if (res.selection === ranks.length)
                return callback ? callback(false) : null;
            rank.addInheritance(ranks[res.selection][0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.addinheritance"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.addInheritance = addInheritance;
    function editPermissions(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const permissions = rank.getPermissions();
        const form = new SimpleForm(Translate.translate("rankperms.form-ui.editpermissions.title", ["{rank}", rankId]), "rankperms.form-ui.editpermissions.description", [
            ...permissions.map((perm) => FormItems.FormButton(Translate.translate("rankperms.form-ui.editpermissions.buttons.permission", ["{permission}", perm]))),
            FormItems.FormButton("rankperms.form-ui.editpermissions.buttons.addpermission", "textures/ui/Add-Ons_8x8.png"),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close", "textures/blocks/barrier.png"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined)
                return;
            if (res.selection === permissions.length + 1)
                return callback ? callback() : null;
            if (res.selection === permissions.length)
                return addPermission(player, rankId, (r) => r ? editPermissions(player, rankId, callback) : true);
            editPermission(player, rankId, permissions[res.selection], () => editPermissions(player, rankId, callback));
        });
    }
    RankPermsUI.editPermissions = editPermissions;
    function editPermission(player, rankId, permission, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!rank.hasPermission(permission)) {
            callback ? callback() : null;
            return;
        }
        rankId = rank.getRankId();
        const form = new SimpleForm(Translate.translate("rankperms.editpermission.title", ["{rank}", rankId]), Translate.translate("rankperms.editpermission.description", ["{permission}", permission]), [
            FormItems.FormButton("rankperms.form-ui.editpermission.buttons.set", "textures/ui/editIcon.png"),
            FormItems.FormButton("rankperms.form-ui.editpermission.buttons.remove", "textures/ui/icon_trash.png"),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close", "textures/blocks/barrier.png"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined)
                return;
            if (res.selection === 0)
                return setPermission(player, rankId, permission, (r) => r ? editPermission(player, rankId, permission, callback) : true);
            if (res.selection === 1)
                return removePermissionConfirm(player, rankId, permission, callback);
        });
    }
    RankPermsUI.editPermission = editPermission;
    function setPermission(player, rankId, permission, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!rank.hasPermission(permission)) {
            callback ? callback(false) : null;
            return;
        }
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.setpermission.title", ["{rank}", rankId]), [
            FormItems.FormInput(Translate.translate("rankperms.form-ui.setpermission.contents.permission", ["{target}", permission]), "rankperms.form-ui.setpermission.contents.permission.placeholder", permission),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.setPermission(permission, res.formValues[0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.setpermission"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.setPermission = setPermission;
    function addPermission(player, rankId, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        rankId = rank.getRankId();
        const form = new CustomForm(Translate.translate("rankperms.form-ui.addpermission.title", ["{rank}", rankId]), [
            FormItems.FormInput("rankperms.form-ui.addpermission.contents.permission", "rankperms.form-ui.addpermission.contents.permission.placeholder"),
        ]);
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined)
                return;
            rank.addPermission(res.formValues[0])
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.addpermission"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.addPermission = addPermission;
    function removePermissionConfirm(player, rankId, permission, callback) {
        const rank = RankPerms.getRank(rankId);
        if (!rank)
            return Translate.sendTranslate(player, "rankperms.error.notfound.rank");
        if (!rank.hasPermission(permission)) {
            callback ? callback(false) : null;
            return;
        }
        rankId = rank.getRankId();
        const form = new ModalForm(Translate.translate("rankperms.form-ui.removepermission.title", ["{rank}", rankId]), Translate.translate("rankperms.form-ui.removepermission.description", [
            ["{rank}", rankId],
            ["{permission}", permission],
        ]));
        form.setButtonConfirm("form-ui.buttons.confirm");
        form.setButtonCancel("form-ui.buttons.cancel");
        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (!res.selection)
                return;
            RankPerms.removePermission(rankId, permission)
                .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.removepermission"))
                .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }
    RankPermsUI.removePermissionConfirm = removePermissionConfirm;
})(RankPermsUI || (RankPermsUI = {}));
export default RankPermsUI;
