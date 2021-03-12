import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "./commandOptions";
import {CommandContext} from "./commandContext";
import {CommandPermissions} from "../_helpers/commandPermissions";

export abstract class Command {
    readonly name: string;
    readonly commandOptions: CommandOptions;

    constructor(name: string, commandOptions: CommandOptions) {
        this.name = name;
        this.commandOptions = commandOptions;
    }

    protected abstract execute(commandContext: CommandContext);

    public async run(message: Message){
        const commandContext = new CommandContext(message);
        await Command.cacheMemberOnGuild(message);
        const commandPermissions = CommandPermissions.checkPermissions(message, this.commandOptions);
        if(!commandPermissions.permissionError){
            this.execute(commandContext);
            return;
        }
        this.showError(commandPermissions);
    };

    private showError(commandPermissions: CommandPermissions){

    }

    /* Fetch member if not cached, if the member on a guild is invisible or not cached */
    private static async cacheMemberOnGuild(message: Message) {
        if (message.guild && !message.member) {
            await message.guild.members.fetch(message.author.id);
        }
    }
}