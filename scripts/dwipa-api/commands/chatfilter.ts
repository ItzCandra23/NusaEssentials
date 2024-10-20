import ChatFilter from "../chatfilter";
import { command } from "../command";

command.register("chatfilter", "commands.chatfilter.description", "ChatFilter", "chatfilter.cmd.admin", (p, player) => {
    ChatFilter.adminUI(player);
}, {});