import Translate from "../translate";

Translate.createLanguage("en-US", {
    "chat.muted": "§cYou are muted!",
    "command.error.params": "§cError! Commmand: {error}§r§c Invalid command parameters",

    "commands.helpall.description": "Provides help/list of commands",
    "commands.about.description": "Send addon information",

    "commands.pluginadm.description": "Plugins Manager for Admin",
    "commands.plugin.description": "List/Check available plugins",
    "commands.plugin.error": "§cPlugin not found!",

    "commands.category.description": "List/Check Category Commands",
    "commands.category.error": "§cCategory not found!",

    "commands.help.description": "Provides help/list of commands",
    "commands.help.error": "§cCommand not found!",
    "commands.help.result": "§8---- §2Nusa§dCommands §7page {page} of {max_page} §8----§r\n{commands}§r\n§2Use {prefix}help <page> for switch page or use {prefix}help <command> for command details",
    "commands.help.result.category": "§8+---§e {category} §r§8---+",
    "commands.help.result.commandline": "§r§e- §a{prefix}{command} {parameters} §b- {description}",
    "commands.help.result.command": "§8---- §2Nusa§dCommand §7{command} §8----§r\n§e-§r Command: §a{prefix}{command} {parameters}§r\n§e-§r Description: §b{description}§r\n§e-§r Permission: §e{permission}§r\n§e-§r Category: §9{category}§r\n§2Use {prefix}help <page> for switch page or use {prefix}help <command> for command details",

    "commands.config.description": "Customize addon configuration",
    "commands.setlanguage.description": "Change addon language",

    "commands.rankadm.description": "Rank Permission admin commands",
    
    "translate.success.set": "[Language] §aSuccess to set language",
    "translate.error.notfound": "[Language] §cLanguage not found!",

    "translate.form-ui.setlanguage.title": "§bSet §aLanguage",
    "translate.form-ui.setlanguage.contents.languages": "Languages:",
    "translate.form-ui.setlanguage.contents.devmode": "Dev Mode:",
    "translate.form-ui.setlanguage.contents.v2": "Translate v2:",

    "rankperms.error.access": "[RankPerms] §cError Access!",
    "rankperms.error.invalid.display": "[RankPerms] §cInvalid display!",
    "rankperms.error.invalid.format": "[RankPerms] §cInvalid format!",
    "rankperms.error.invalid.move": "[RankPerms] §cInvalid move!",
    "rankperms.error.invalid.rank": "[RankPerms] §cInvalid rank!",
    "rankperms.error.invalid.permission": "[RankPerms] §cInvalid permission!",
    "rankperms.error.already.rank": "[RankPerms] §cRank already!",
    "rankperms.error.already.permission": "[RankPerms] §cPermission already!",
    "rankperms.error.notfound.rank": "[RankPerms] §cRank not found!",
    "rankperms.error.notfound.permission": "[RankPerms] §cPermission not found!",

    "rankperms.success.createrank": "[RankPerms] §aSuccess to create rank!",
    "rankperms.success.deleterank": "[RankPerms] §aSuccess to delete rank!",
    "rankperms.success.renamerank": "[RankPerms] §aSuccess to rename rank!",
    "rankperms.success.moverank": "[RankPerms] §aSuccess to move rank!",

    "rankperms.success.addinheritance": "[RankPerms] §aSuccess to add inheritance!",
    "rankperms.success.addpermission": "[RankPerms] §aSuccess to add permission!",
    "rankperms.success.removepermission": "[RankPerms] §aSuccess to remove permission!",
    "rankperms.success.setpermission": "[RankPerms] §aSuccess to set permission!",

    "rankperms.success.setdisplay": "[RankPerms] §aSuccess to set display!",
    "rankperms.success.setformat": "[RankPerms] §aSuccess to set format!",

    "rankperms.form-ui.main.title": "§bRank§aPerms",
    "rankperms.form-ui.main.description": "",
    "rankperms.form-ui.main.buttons.rank": "{display}§r\n§a{rank}",
    "rankperms.form-ui.main.buttons.createrank": "§2Create Rank",

    "rankperms.form-ui.createrank.title": "§eCreate§aRank",
    "rankperms.form-ui.createrank.contents.rankid": "Rank Id:",
    "rankperms.form-ui.createrank.contents.rankid.placeholder": "Rank Name",
    "rankperms.form-ui.createrank.contents.display": "Display:",
    "rankperms.form-ui.createrank.contents.display.placeholder": "Rank Display",

    "rankperms.form-ui.deleterank.title": "§eDelete§aRank: §r{rank}",
    "rankperms.form-ui.deleterank.description": "Are you sure want to delete this rank?\n\nRank Id: §a{rank}§r\nDefault: §b{default}§r\nDisplay: {display}§r\nPermissions:\n{permissions}§r\n",
    "rankperms.form-ui.deleterank.description.permission": "    §7- §e{permission}§r\n",

    "rankperms.form-ui.editrank.title": "§eEdit§aRank: §r{rank}",
    "rankperms.form-ui.editrank.description": "\nRank Id: §a{rank}§r\nDefault: §b{default}§r\nDisplay: {display}§r\nPermissions:\n{permissions}§r\n",
    "rankperms.form-ui.editrank.description.permission": "    §7- §e{permission}§r\n",
    "rankperms.form-ui.editrank.buttons.rename": "§2Rename",
    "rankperms.form-ui.editrank.buttons.setdefault": "§2Set as Default Rank",
    "rankperms.form-ui.editrank.buttons.moveup": "§2Move Up",
    "rankperms.form-ui.editrank.buttons.movedown": "§2Move Down",
    "rankperms.form-ui.editrank.buttons.setdisplay": "§2Set Display",
    "rankperms.form-ui.editrank.buttons.permissions": "§2Permissions",
    "rankperms.form-ui.editrank.buttons.addinheritance": "§2Add Inheritance",
    "rankperms.form-ui.editrank.buttons.setformatchat": "§2Set Format Chat",
    "rankperms.form-ui.editrank.buttons.setformatname": "§2Set Format Name",
    "rankperms.form-ui.editrank.buttons.deleterank": "§4Delete Rank",

    "rankperms.form-ui.renamerank.title": "§eRename§aRank: §r{rank}",
    "rankperms.form-ui.renamerank.contents.rankid": "Rank Id:",
    "rankperms.form-ui.renamerank.contents.rankid.placeholder": "Rank Id",

    "rankperms.form-ui.setdisplay.title": "§eSet§aDisplay: §r{rank}",
    "rankperms.form-ui.setdisplay.contents.display": "Display:",
    "rankperms.form-ui.setdisplay.contents.display.placeholder": "Rank Display",

    "rankperms.form-ui.setformatchat.title": "§eSet§aFormatChat: §r{rank}",
    "rankperms.form-ui.setformatchat.contents.format": "Format:",
    "rankperms.form-ui.setformatchat.contents.format.placeholder": "Format Chat",

    "rankperms.form-ui.setformatname.title": "§eSet§aFormatName: §r{rank}",
    "rankperms.form-ui.setformatname.contents.format": "Format:",
    "rankperms.form-ui.setformatname.contents.format.placeholder": "Format Name",

    "rankperms.form-ui.addinheritance.title": "§eAdd§aInheritance: §r{rank}",
    "rankperms.form-ui.addinheritance.description": "Click rank to add inheritance",
    "rankperms.form-ui.addinheritance.buttons.rank": "{display}§r\n§a{rank}",

    "rankperms.form-ui.editpermissions.title": "§eEdit§aPermissions: §r{rank}",
    "rankperms.form-ui.editpermissions.description": "",
    "rankperms.form-ui.editpermissions.buttons.permission": "§d{permission}§r\n§eEdit Permission",
    "rankperms.form-ui.editpermissions.buttons.addpermission": "§2Add Permission",

    "rankperms.form-ui.editpermission.title": "§eEdit§aPermission: §r{rank}",
    "rankperms.form-ui.editpermission.description": "Permission: §e{permission}",
    "rankperms.form-ui.editpermission.buttons.set": "§2Set Permission",
    "rankperms.form-ui.editpermission.buttons.remove": "§4Remove Permission",

    "rankperms.form-ui.setpermission.title": "§eSet§aPermission: §r{rank}",
    "rankperms.form-ui.setpermission.contents.permission": "Target: §e{target}§r\n\nPermission:",
    "rankperms.form-ui.setpermission.contents.permission.placeholder": "Rank Permission",
    
    "rankperms.form-ui.addpermission.title": "§eAdd§aPermission: §r{rank}",
    "rankperms.form-ui.addpermission.contents.permission": "Permission:",
    "rankperms.form-ui.addpermission.contents.permission.placeholder": "example.rank.permission",

    "rankperms.form-ui.removepermission.title": "§eRemove§aPermission: §r{rank}",
    "rankperms.form-ui.removepermission.description": "Are you sure want to remove this permission?n\n\nRank Id: §a{rank}§r\nPermission: §e{permission}§r\n\n",

    "playerrank.error.notfound.player": "[PlayerRank] §cPlayer Id not found!",
    "playerrank.error.notfound.rank": "[PlayerRank] §cRank Id not found!",
    "playerrank.error.already": "[PlayerRank] §cAlready!",

    "form-ui.buttons.confirm": "§8[ §aCONFIRM §8]",
    "form-ui.buttons.cancel": "§8[ §cCANCEL §8]",
    "form-ui.buttons.close": "§8[ §cCLOSE §8]",
    "form-ui.buttons.back": "§8[ §cBACK §8]",
    "form-ui.message.busy": "§aFormUI §r§8» §fPress Jump to run/open ui menu before 1 minuits timeout left",
    "form-ui.error.value": "§cInvalid value!",

    "config.success.set": "[Config] §aSuccess to set!",
    "config.success.reset": "[Config] §aSuccess to reset!",
    "config.error.value": "[Config] §cInvalid value!",

    "config.form-ui.setconfig.title": "§2Config§dUI",
    "config.form-ui.setconfig.description": "§a- Data:§r {data}§r\n§a- Path:§e {path}§r\n\nType ({type})",
    
    "config.form-ui.reset.title": "§2Config§dUI",
    "config.form-ui.reset.description": "Are you sure want to reset §a{path}§r?",
    "config.form-ui.reset.buttons.confirm": "§cYes",
    "config.form-ui.reset.buttons.cancel": "§aNo",

    "chatfilter.error.invalid": "[ChatFilter] §cInvalid filter!",
    "chatfilter.error.already": "[ChatFilter] §cFilter already!",
    "chatfilter.error.notfound": "[ChatFilter] §cFilter not found!",
    
    "chatfilter.form-ui.admin.title": "§aChat§dFilter",
    "chatfilter.form-ui.admin.description": "",
    "chatfilter.form-ui.admin.buttons.filter": "§a{filter}§r\n§cClick to Remove",
    "chatfilter.form-ui.admin.buttons.addfilter": "§aAdd Filter",
    
    "chatfilter.form-ui.addfilter.title": "§dAdd §2Filter",
    "chatfilter.form-ui.addfilter.contents.filter": "Filter:",
    "chatfilter.form-ui.addfilter.contents.filter.placeholder": "Hi=Hello  Sensor=*",
}, "ItzCandra23");