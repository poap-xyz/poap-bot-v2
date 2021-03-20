import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {injectable} from "inversify";

export default class PingCommand extends Command{
    constructor() {
        super("ping",
            {aliases: [],
                            commandType: {DMCommand: false, GuildCommand: true},
                            botPermissions: [],
                            memberPermissions: []})
    }

    protected execute(commandContext: CommandContext) {
        return commandContext.message.reply("pong");
    }
}
