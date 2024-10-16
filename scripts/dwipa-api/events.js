import { CustomCommandFactory } from "./command";
import PlayerRank from "./playerrank";
var NusaEvents;
(function (NusaEvents) {
    function onPlayerNameTagChange(callback) {
        PlayerRank.onPlayerNameTagChange(callback);
    }
    NusaEvents.onPlayerNameTagChange = onPlayerNameTagChange;
    function onPlayerChat(callback) {
        CustomCommandFactory.onPlayerChat(callback);
    }
    NusaEvents.onPlayerChat = onPlayerChat;
    function onPlayerRankChange(callback) {
        PlayerRank.onPlayerRankChange(callback);
    }
    NusaEvents.onPlayerRankChange = onPlayerRankChange;
})(NusaEvents || (NusaEvents = {}));
export default NusaEvents;
