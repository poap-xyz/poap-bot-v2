import {Command} from "../command";
import {CommandContext} from "../commandContext";

export default class Ping extends Command{
    protected execute(commandContext: CommandContext) {
        return commandContext.originalMessage.reply("pong");
    }
}
