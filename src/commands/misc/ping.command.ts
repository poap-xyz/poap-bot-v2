import {Command} from "../command";
import {CommandContext} from "../commandContext";

export default class PingCommand extends Command{
    constructor() {
        super("ping",
            {aliases: [],
                            commandType: {DMCommand: false, GuildCommand: true},
                            botPermissions: [],
                            memberPermissions: []},
                4);
    }

    protected execute(commandContext: CommandContext) {
        return commandContext.message.reply("pong");
    }
}
