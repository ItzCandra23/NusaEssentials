import { Player } from "@minecraft/server";
import { CustomForm, FormItems, ModalForm, SimpleForm } from "./form-ui";
import { CommandPermissionLevel } from "./command";
import RankPerms from "./rankpermissions";
import Translate from "./translate";

namespace RankPermsUI {
    
    export function createRank(player: Player, callback?: (response: boolean) => boolean|void) {
        const form = new CustomForm("rankperms.form-ui.createrank.title", [
            FormItems.FormInput("rankperms.form-ui.createrank.contents.rankid", "rankperms.form-ui.createrank.contents.rankid.placeholder"),
            FormItems.FormInput("rankperms.form-ui.createrank.contents.display", "rankperms.form-ui.createrank.contents.display.placeholder"),
        ]);

        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.formValues === undefined) return;

            const rankid = res.formValues[0] as string;
            const display = res.formValues[1] as string;

            RankPerms.createRank(rankid, display)
            .then(() => callback && callback(true) ? Translate.sendTranslate(player, "rankperms.success.createrank") : null)
            .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }

    export function deleteRankAction(player: Player, rankId: string, callback?: (response: boolean) => boolean|void) {
        const rank = RankPerms.getRank(rankId);
        if (!rank) {
            callback ? callback(false) : null;
            return;
        }
        
        const permissions = rank.getPermissions().map((perm) => Translate.translate("rankperms.form-ui.deleterank.description.permission", ["{permission}", perm]));
        const form = new ModalForm(Translate.translate("rankperms.form-ui.deleterank.title", ["{rank}", rank.getRankId()]), Translate.translate("rankperms.form-ui.deleterank.description", [
            ["{rank}", rank.getRankId()],
            ["{display}", rank.getDisplay()],
            ["{format_chat}", rank.getFormatChat()],
            ["{format_name}", rank.getFormatNameTag()],
            ["{permissions}", permissions.join("")],
        ]));

        form.setButtonConfirm("form-ui.buttons.confirm");
        form.setButtonConfirm("form-ui.buttons.cancel");

        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (!res.selection) return;

            RankPerms.deleteRank(rank.getRankId())
            .then(() => callback ? callback(true) : Translate.sendTranslate(player, "rankperms.success.deleterank"))
            .catch((err) => typeof err === "string" ? callback && callback(false) ? Translate.sendTranslate(player, err) : null : null);
        });
    }

    export function editRank(player: Player, rankId: string, callback?: () => void) {
        const rank = RankPerms.getRank(rankId);
        if (!rank) {
            callback ? callback() : null;
            return;
        }

        const permissions = rank.getPermissions().map((perm) => Translate.translate("rankperms.form-ui.editrank.description.permission", ["{permission}", perm]));
        const form = new SimpleForm(Translate.translate("rankperms.form-ui.editrank.title", ["{rank}", rank.getRankId()]), Translate.translate("rankperms.form-ui.editrank.description", [
            ["{rank}", rank.getRankId()], 
            ["{display}", rank.getDisplay()], 
            ["{format_chat}", rank.getFormatChat()],
            ["{format_name}", rank.getFormatNameTag()],
            ["{permissions}", permissions.join("")],
        ]), [
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.moveup", "textures/ui/up_arrow.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.movedown", "textures/ui/down_arrow.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setdisplay", "textures/ui/book_metatag_default.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.permissions", "textures/ui/accessibility_glyph_color.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setformatchat", "textures/ui/editIcon.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.setformatname", "textures/ui/editIcon.png"),
            FormItems.FormButton("rankperms.form-ui.editrank.buttons.deleterank", "textures/ui/icon_trash.png"),
            FormItems.FormButton(callback ? "form-ui.buttons.back" : "form-ui.buttons.close", "textures/blocks/barrier.png"),
        ]);

        form.sendTo(player, CommandPermissionLevel.ADMIN).then((res) => {
            if (res.selection === undefined) return;
            if (res.selection === 7 && callback) return callback();

            if (res.selection === 0) return rank.moveRank("up");
            if (res.selection === 1) return rank.moveRank("down");
            if (res.selection === 2) return setDisplay(player, rank.getRankId(), () => editRank(player, rank.getRankId()));
            if (res.selection === 3) return editPermissions(player, rank.getRankId(), () => editRank(player, rank.getRankId()));
            if (res.selection === 4) return setFormatChat(player, rank.getRankId(), () => editRank(player, rank.getRankId()));
            if (res.selection === 5) return setFormatName(player, rank.getRankId(), () => editRank(player, rank.getRankId()));
            if (res.selection === 6) return deleteRankAction(player, rank.getRankId(), callback);
        });
    }

    export function setDisplay(player: Player, rankId: string, callback?: (response: boolean) => boolean|void) {
        const rank = RankPerms.getRank(rankId);
        if (!rank) return callback ? callback(false) : null;

        const form = new CustomForm(Translate.translate("rankperms.form-ui.setdisplay.title", ["{rank}", rank.getRankId()]), [
            FormItems.FormInput("rankperms.form-ui.setdisplay.contents.display", "rankperms.form-ui.setdisplay.contents.display.placeholder", rank.getDisplay()),
        ]);
    }
}