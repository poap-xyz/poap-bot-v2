import {DMChannel, GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "../../interfaces/command/commandOptions";

export type PermissionType = 'GUILD_LACK_OF_PERMISSIONS' | 'MEMBER_LACK_OF_PERMISSIONS' | 'UNSUPPORTED_CHANNEL' | 'PERMISSION_OK';

export type PermissionStatus = {permissionType: PermissionType,
                                botInsufficientPermissions: PermissionResolvable[],
                                memberInsufficientPermissions: PermissionResolvable};

export class PermissionManager {

    public static checkPermissions(message: Message, commandOptions: CommandOptions): PermissionStatus{
        if(message.channel instanceof DMChannel) {
            return this.checkPermissionsStatus(commandOptions.commandType.DMCommand, [], []);
        }

        return this.checkGuildPermissions(message, commandOptions);
    }

    private static checkGuildPermissions(message: Message, commandOptions: CommandOptions){
        const guild = message.guild && message.guild.me;
        const member = message.member;

        const botInsufficientPermissions = this.getInsufficientPermissions(guild, commandOptions.botPermissions);
        const memberInsufficientPermissions = this.getInsufficientPermissions(member, commandOptions.memberPermissions);

        return this.checkPermissionsStatus(commandOptions.commandType.GuildCommand, botInsufficientPermissions, memberInsufficientPermissions);
    }

    private static checkPermissionsStatus(commandType: boolean,
                                         botInsufficientPermissions: PermissionResolvable[],
                                         memberInsufficientPermissions: PermissionResolvable[]): PermissionStatus{
        const insufficientPermissions = {botInsufficientPermissions: botInsufficientPermissions,
                                        memberInsufficientPermissions: memberInsufficientPermissions};

        if(!commandType) {
            return {...insufficientPermissions, permissionType: "UNSUPPORTED_CHANNEL"}
        }

        if(botInsufficientPermissions.length > 0){
            return {...insufficientPermissions, permissionType: "GUILD_LACK_OF_PERMISSIONS",}
        }

        if(memberInsufficientPermissions.length > 0){
            return {...insufficientPermissions, permissionType: "MEMBER_LACK_OF_PERMISSIONS",}
        }

        return {...insufficientPermissions, permissionType: "PERMISSION_OK"};
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
