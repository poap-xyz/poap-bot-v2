import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "./commandOptions";
import {CommandContext} from "./commandContext";

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
        if(this.checkGuildOnly(message)){
            this.execute(commandContext);
        }
    };

    /* Fetch member if not cached, if the member on a guild is invisible or not cached */
    private static async cacheMemberOnGuild(message: Message) {
        if (message.guild && !message.member) {
            await message.guild.members.fetch(message.author.id);
        }
    }

    private checkGuildOnly(message: Message): boolean{

        if(guildOnly && !!message.guild){
            return this.botHasPermissionToRun(message.guild.me);
        }

        return ;
    }

    private botHasPermissionToRun(guild: GuildMember): boolean{
        return this.checkForPermission(guild, this.commandOptions.botPermissions).length > 0;
    }

    private memberHasPermissionToRun(member: GuildMember): boolean{
        return this.checkForPermission(member, this.commandOptions.memberPermissions).length > 0;
    }

    private checkForPermission(member: GuildMember, permissions: PermissionResolvable[]): PermissionResolvable[]{
        let neededPermissions = [];

        permissions.forEach((perm) => {
            if(!(member.hasPermission(perm))){
                neededPermissions.push(perm);
            }
        });

        return neededPermissions;
    }
}
