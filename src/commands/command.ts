import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "./commandOptions";
import {CommandContext} from "./commandContext";
import {PermissionManager} from "../_helpers/commandUtils/permissionManager";

export abstract class Command {
    readonly name: string;
    readonly commandOptions: CommandOptions;

    constructor(name: string, commandOptions: CommandOptions) {
        this.name = name;
        this.commandOptions = commandOptions;
    }

    protected abstract execute(commandContext: CommandContext): Promise<Message>;

    public isCommandCalledByMessage(message: Message): boolean{
        const commandContext = new CommandContext(message, this.name, this.commandOptions);
        return commandContext.isCommandCalledByMessage();
    }

    public async run(message: Message): Promise<Message | Message[]> {
        const commandContext = new CommandContext(message, this.name, this.commandOptions);

        if (commandContext.hasPermissionToRun()) {
            return await this.execute(commandContext);
        }

        this.showError(commandContext.getCommandPermissions());
    };

    private showError(commandPermissions: PermissionManager){
        //TODO
    }


}
