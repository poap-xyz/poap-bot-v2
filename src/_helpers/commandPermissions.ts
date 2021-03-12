import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "../commands/commandOptions";
import {CommandChannel} from "./commandChannel";

export type PermissionErrorType = 'GUILD_LACK_OF_PERMISSIONS' | 'MEMBER_LACK_OF_PERMISSIONS' | 'UNSUPPORTED_CHANNEL' | null;

export type PermissionStatus = {permissionError: boolean, insufficientPermissions: PermissionResolvable[], errorType: PermissionErrorType};

export class CommandPermissions{
    public static checkPermissions(message: Message, commandOptions: CommandOptions): PermissionStatus{
        const guild = message.guild.me;
        const member = message.member;

        const botInsufficientPermissions = this.getInsufficientPermissions(guild, commandOptions.botPermissions);
        const memberInsufficientPermissions = this.getInsufficientPermissions(member, commandOptions.memberPermissions);

        if(CommandChannel.getCommandType(message) === 'DM_COMMAND') {
            return this.checkPermissionsStatus(commandOptions.commandType.DMCommand, botInsufficientPermissions, memberInsufficientPermissions);
        }

        return this.checkPermissionsStatus(commandOptions.commandType.GuildCommand, botInsufficientPermissions, memberInsufficientPermissions);;
    }

    private static checkPermissionsStatus(commandType: boolean,
                                         botInsufficientPermissions: PermissionResolvable[],
                                         memberInsufficientPermissions: PermissionResolvable[]): PermissionStatus{
        if(!commandType) {
            return {permissionError: true, errorType: "UNSUPPORTED_CHANNEL", insufficientPermissions: []}
        }

        if(botInsufficientPermissions.length > 0){
            return {
                permissionError: true,
                insufficientPermissions: botInsufficientPermissions,
                errorType: "GUILD_LACK_OF_PERMISSIONS",
            }
        }

        if(memberInsufficientPermissions.length > 0){
            return {
                permissionError: true,
                insufficientPermissions: memberInsufficientPermissions,
                errorType: "MEMBER_LACK_OF_PERMISSIONS",
            }
        }

        return {permissionError: false, errorType: null, insufficientPermissions: []}
    }

    private static hasPermissionToRun(guildMember: GuildMember, permissions: PermissionResolvable[]): boolean{
        return this.getInsufficientPermissions(guildMember, permissions).length > 0;
    }

    private static getInsufficientPermissions(member: GuildMember, permissions: PermissionResolvable[]): PermissionResolvable[]{
        let neededPermissions = [];
        if(!member)
            return neededPermissions;

        permissions.forEach((perm) => {
            if(!(member.hasPermission(perm))){
                neededPermissions.push(perm);
            }
        });

        return neededPermissions;
    }
}
