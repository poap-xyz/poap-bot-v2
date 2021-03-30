import {Command} from "../command";
import {CommandContext} from "../commandContext";

export default class InstructionsCommand extends Command{
    constructor() {
        super("instructions",
            {aliases: ["instruction", "help"],
                commandType: {DMCommand: true, GuildCommand: true},
                botPermissions: [],
                memberPermissions: []})
    }

    protected execute(commandContext: CommandContext) {
        return commandContext.message.reply(":warning: :warning: :warning: :warning: **You MUST send me a DIRECT MESSAGE with the code** :warning: :warning: :warning: :warning:  (click my name)");
    }
}