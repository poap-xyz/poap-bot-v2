import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "../interfaces/command/commandOptions";
import {CommandContext} from "./commandContext";
import {PermissionStatus} from "../_helpers/utils/permissionManager";
export abstract class Command {
    readonly name: string;
    readonly commandOptions: CommandOptions;

    protected constructor(name: string, commandOptions: CommandOptions) {
        this.name = name;
        this.commandOptions = commandOptions;
    }

    protected abstract execute(commandContext: CommandContext): Promise<Message | Message[]>;

    public isCommandCalledByMessage(message: Message): Promise<boolean>{
        const commandContext = new CommandContext(message, this.name, this.commandOptions);
        return Promise.resolve(commandContext.isCommandCalledByMessage());
    }

    public run(message: Message): Promise<Message | Message[]> {
        const commandContext = new CommandContext(message, this.name, this.commandOptions);

        if (commandContext.hasPermissionToRun()) {
            return this.execute(commandContext);
        }

        return Command.showError(message, commandContext.getCommandPermissions());
    };

    private static showError(message:Message, commandPermissions: PermissionStatus): Promise<Message | Message[]>{
        switch(commandPermissions.permissionType){
            case "GUILD_LACK_OF_PERMISSIONS":
                return message.reply(`Bot have no permissions to execute this command`);
            case "MEMBER_LACK_OF_PERMISSIONS":
                return message.reply(`You have no permissions to execute this command`);
            case "UNSUPPORTED_CHANNEL":
                return message.reply(`This command can not be executed in this channel`);
        }
        return message.reply(`Error in command permissions`);
    }


}
