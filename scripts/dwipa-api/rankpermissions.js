import { system } from "@minecraft/server";
import Database from "./database";
class RankPerms {
    /**Get All Raw Rank Data */
    static getRawRanks() {
        var _a;
        return (_a = Database.get("ranks")) !== null && _a !== void 0 ? _a : {
            Member: {
                display: "§eMember",
                format: {
                    nameTag: "§2[{display}§r§2] {player}",
                    chat: "§7[§r{display}§r§7] {player}:§r {message}",
                },
                permissions: [],
            }
        };
    }
    /**
     * Move Rank
     * @param rankId Rank Id
     * @param direction Move Direction
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.invalid.move" Invalid move or out of value
     * @returns (void) -- Success to move
     */
    static moveRank(rankId, direction) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            const keys = Object.keys(ranks);
            const index = keys.indexOf(rankId);
            if (index === -1)
                reject("rankperms.error.notfound.rank");
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= keys.length)
                reject("rankperms.error.invalid.move");
            let newKeys = [...keys];
            [newKeys[index], newKeys[newIndex]] = [newKeys[newIndex], newKeys[index]];
            let newObj = {};
            for (const k of newKeys) {
                newObj[k] = ranks[k];
            }
            Database.set("ranks", newObj);
            resolve();
        }));
    }
    /**
     * Create Rank
     * @param rankId Rank Id
     * @param display Name Display
     * @param permissions Rank Permissions Access
     * @throws "rankperms.error.invalid.rank" Invalid Rank Id characters or Rank Id exceeds 20 characters
     * @throws "rankperms.error.invalid.display" Invalid Rank Display not found
     * @throws "rankperms.error.already.rank" Rank Id Already
     * @returns (RankPerms) -- Success to create
     */
    static createRank(rankId, display = rankId, permissions = []) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            const idRegex = /^[a-zA-Z0-9_-]+$/;
            const permRegex = /^[a-zA-Z0-9._-]+$/;
            if (!idRegex.test(rankId) || rankId.length > 24)
                reject("rankperms.error.invalid.rank");
            if (Object.keys(ranks).some(key => key.toLowerCase() === rankId.toLowerCase()))
                reject("rankperms.error.already.rank");
            if (display === "" || display === " ".repeat(display.length))
                reject("rankperms.error.invalid.display");
            let data = {
                display,
                format: {
                    nameTag: "§2[{display}§r§2] {player}",
                    chat: "§7[§r{display}§r§7] §8{player}:§r {message}",
                },
                permissions: permissions.filter((v) => permRegex.test(v)),
            };
            ranks[rankId] = data;
            Database.set("ranks", ranks);
            resolve(new RankPerms(rankId));
        }));
    }
    /**
     * Delete Rank
     * @param rankId Rank Id
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.access" Cant delete default rank
     * @returns (void) -- Success to delete
     */
    static deleteRank(rankId) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            if (!ranks.hasOwnProperty(rankId))
                reject("rankperms.error.notfound.rank");
            if (Object.keys(ranks)[0] === rankId)
                reject("rankperms.error.access");
            delete ranks[rankId];
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Get Rank Display
     * @param rankId Rank Id
     * @returns (string) -- Rank Display or ("") if Rank not found
     */
    static getDisplay(rankId) {
        let ranks = RankPerms.getRawRanks();
        let rank = ranks[rankId];
        if (!rank)
            return "";
        return rank.display;
    }
    /**
     * Set Rank Display
     * @param rankId Rank Id
     * @param display Name Display
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.invalid.display" Invalid Rank Display
     * @returns (void) -- Success to set display
     */
    static setDisplay(rankId, display) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            if (display === "" || display === " ".repeat(display.length))
                reject("rankperms.error.invalid.display");
            rank.display = display;
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Get Raw Rank Format Chat
     * @param rankId Rank Id
     * @returns (string) -- Format Chat or ("") if Rank not found
     */
    static getFormatChat(rankId) {
        let ranks = RankPerms.getRawRanks();
        let rank = ranks[rankId];
        if (!rank)
            return "";
        return rank.format.chat;
    }
    /**
     * Set Raw Rank Format Chat
     * @param rankId Rank Id
     * @param format Chat Format
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.invalid.format" Invalid Rank Format
     * @returns (void) -- Success to set format
     */
    static setFormatChat(rankId, format) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            if (format === "" || format === " ".repeat(format.length))
                reject("rankperms.error.invalid.format");
            rank.format.chat = format;
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Get Raw Rank Format NameTag
     * @param rankId Rank Id
     * @returns (string) -- Format NameTag or ("") if Rank not found
     */
    static getFormatNameTag(rankId) {
        let ranks = RankPerms.getRawRanks();
        let rank = ranks[rankId];
        if (!rank)
            return "";
        return rank.format.nameTag;
    }
    /**
     * Set Raw Rank Format nameTag
     * @param rankId Rank Id
     * @param format NameTag Format
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.invalid.format" Invalid Rank Format
     * @returns (void) -- Success to set format
     */
    static setFormatNameTag(rankId, format) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            if (format === "" || format === " ".repeat(format.length))
                reject("rankperms.error.invalid.format");
            rank.format.nameTag = format;
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Get Rank Permissions
     * @param rankId Rank Id
     * @returns (string[]) -- Rank Permissions or ([]) if Rank not found
     */
    static getPermissions(rankId) {
        let ranks = RankPerms.getRawRanks();
        let rank = ranks[rankId];
        if (!rank)
            return [];
        return rank.permissions;
    }
    /**
     * Check rank permission
     * @param rankId Rank Id
     * @param permission Permission
     * @returns (true) If rank have permission or (false) if rank dont have permission
     */
    static hasPermission(rankId, permission) {
        const rank = RankPerms.getPermissions(rankId);
        if (rank.some((v) => v.toUpperCase() === "ADMIN"))
            return true;
        return rank.some((v) => v.toLowerCase() === permission.toLowerCase());
    }
    /**
     * Add Rank Permissions
     * @param rankId Rank Id
     * @param permission Rank Permission
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.invalid.permission" Invalid Rank Permission
     * @throws "rankperms.error.already.permission" Rank Permission already added
     * @returns (void) -- Added Permission
     */
    static addPermission(rankId, permission) {
        return new Promise((resolve, reject) => system.run(() => {
            const regex = /^[a-zA-Z0-9._-]+$/;
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            if (!regex.test(permission))
                reject("rankperms.error.invalid.permission");
            if (rank.permissions.some((v) => v.toLowerCase() === permission.toLowerCase()))
                reject("rankperms.error.already.permission");
            rank.permissions.push(permission);
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Remove Rank Permissions
     * @param rankId Rank Id
     * @param permission Rank Permission
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.notfound.permission" Rank Permission not found
     * @returns (void) -- Deleted Permission
     */
    static removePermission(rankId, permission) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            if (!rank.permissions.some((v) => v.toLowerCase() === permission.toLowerCase()))
                reject("rankperms.error.notfound.permission");
            rank.permissions = rank.permissions.filter((v) => v.toLowerCase() !== permission.toLowerCase());
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Set Rank Permissions
     * @param rankId Rank Id
     * @param target Target Rank Permission
     * @param permission Rank Permission
     * @throws "rankperms.error.notfound.rank" Rank Id not found
     * @throws "rankperms.error.notfound.permission" Rank Permission not found
     * @throws "rankperms.error.invalid.permission" Invalid Rank Permission
     * @throws "rankperms.error.already.permission" Already Rank Permission
     * @returns (void) -- Deleted Permission
     */
    static setPermission(rankId, target, permission) {
        return new Promise((resolve, reject) => system.run(() => {
            let ranks = RankPerms.getRawRanks();
            let rank = ranks[rankId];
            if (!rank)
                reject("rankperms.error.notfound.rank");
            const regex = /^[a-zA-Z0-9._-]+$/;
            const targetIndex = rank.permissions.findIndex((v) => v.toLowerCase() === target.toLowerCase());
            if (targetIndex === -1)
                reject("rankperms.error.notfound.permission");
            if (!regex.test(permission))
                reject("rankperms.error.invalid.permission");
            if (rank.permissions.some((v) => v.toLowerCase() === permission.toLowerCase()))
                reject("rankperms.error.already.permission");
            rank.permissions[targetIndex] = permission;
            Database.set("ranks", ranks);
            resolve();
        }));
    }
    /**
     * Check Rank have admin permission
     * @param rankId Rank Id
     * @returns (true) if Admin or (false) if not Admin
     */
    static isAdmin(rankId) {
        const rank = RankPerms.getPermissions(rankId);
        return (rank.some((v) => v.toUpperCase() === "ADMIN"));
    }
    static getRank(rankId) {
        const _rankId = Object.keys(RankPerms.getRawRanks()).find((v) => v.toLowerCase() === rankId.toLowerCase());
        if (!_rankId)
            return null;
        return new RankPerms(rankId);
    }
    constructor(rankId) {
        this.rankId = rankId;
    }
    getRankId() {
        var _a;
        return (_a = Object.keys(RankPerms.getRawRanks()).find((v) => v.toLowerCase() === this.rankId.toLowerCase())) !== null && _a !== void 0 ? _a : this.rankId;
    }
    getDisplay() {
        return RankPerms.getDisplay(this.rankId);
    }
    setDisplay(display) {
        return RankPerms.setDisplay(this.rankId, display);
    }
    getFormatChat() {
        return RankPerms.getFormatChat(this.rankId);
    }
    getFormatNameTag() {
        return RankPerms.getFormatNameTag(this.rankId);
    }
    setFormatChat(format) {
        return RankPerms.setFormatChat(this.rankId, format);
    }
    setFormatNameTag(format) {
        return RankPerms.setFormatNameTag(this.rankId, format);
    }
    getPermissions() {
        return RankPerms.getPermissions(this.rankId);
    }
    hasPermission(permission) {
        return RankPerms.hasPermission(this.rankId, permission);
    }
    addPermission(permission) {
        return RankPerms.addPermission(this.rankId, permission);
    }
    removePermission(permission) {
        return RankPerms.removePermission(this.rankId, permission);
    }
    setPermission(target, permission) {
        return RankPerms.setPermission(this.rankId, target, permission);
    }
    moveRank(direction) {
        return RankPerms.moveRank(this.rankId, direction);
    }
    isAdmin() {
        return RankPerms.isAdmin(this.rankId);
    }
    isValid() {
        return Object.keys(RankPerms.getRawRanks()).includes(this.rankId);
    }
    destruct() {
        this.rankId = "";
    }
}
export default RankPerms;
