import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "../interfaces/command/commandOptions";
import {CommandContext} from "./commandContext";
import {PermissionManager} from "../_helpers/utils/permissionManager";
import {injectable} from "inversify";

@injectable()
export abstract class Command {
    readonly name: string;
    readonly commandOptions: CommandOptions;

    constructor(name: string, commandOptions: CommandOptions) {
        this.name = name;
        this.commandOptions = commandOptions;
    }

    protected abstract execute(commandContext: CommandContext): Promise<Message | Message[]>;

    public isCommandCalledByMessage(message: Message): boolean{
        const commandContext = new CommandContext(message, this.name, this.commandOptions);
        return commandContext.isCommandCalledByMessage();
    }

    public run(message: Message): Promise<Message | Message[]> {
        const commandContext = new CommandContext(message, this.name, this.commandOptions);

        if (commandContext.hasPermissionToRun()) {
            return this.execute(commandContext);
        }

        return this.showError(message, commandContext.getCommandPermissions());
    };

    private showError(message:Message, commandPermissions: PermissionManager): Promise<Message | Message[]>{
        //todo
        return message.reply(`Error in command permissions`);
    }


}
