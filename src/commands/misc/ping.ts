import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {CommandOptions} from "../commandOptions";
import {Permissions} from "discord.js"
export default class Ping extends Command{
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
