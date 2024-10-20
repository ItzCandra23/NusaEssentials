# NusaEssentials (PROJECT)

NusaEssentials is a essentials addon for Survival Economy Server in Minecraft. This essentials have soo many features thats can make you more easily to creating Survival Economy Server/Realms

# Custom Command Examples
```ts
import { command, CommandPermissionLevel } from "../command";

command.register("commandname", "Command Description", "Command Category", "command.permission", (parameters, player) => {
    // Your logic command
    player.sendMessage("Message: " + p.example);
}, {
    // Your parameters
    example: "string",
});

command.register("setop", "Set Player OP", "Commands", CommandPermissionLevel.ADMIN, (p, player) => {
    p.target.setOp(true);
}, {
    target: "player",
});

command.register("burn", "Burn other player in 5s", "Troll", "troll.cmd.burn", (p, player) => {
    const target = p.target;
    const time = Math.abs(p.time ?? 5);

    player.sendMessage(`Burn ${target.name} in ${time}`);
    target.setOnFire(time);
}, {
    target: "player",
    time: ["number", true],
});
```
