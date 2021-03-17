import {GuildMember, Message, PermissionResolvable} from "discord.js";
import {CommandOptions} from "../../commands/commandOptions";
import {MessageChannelHandler} from "./messageChannelHandler";

export type PermissionType = 'GUILD_LACK_OF_PERMISSIONS' | 'MEMBER_LACK_OF_PERMISSIONS' | 'UNSUPPORTED_CHANNEL' | 'PERMISSION_OK';

export type PermissionStatus = {permissionType: PermissionType,
                                botInsufficientPermissions: PermissionResolvable[],
                                memberInsufficientPermissions: PermissionResolvable};

export class PermissionManager {

    public static checkPermissions(message: Message, commandOptions: CommandOptions): PermissionStatus{
        const guild = message.guild.me;
        const member = message.member;

        const botInsufficientPermissions = this.getInsufficientPermissions(guild, commandOptions.botPermissions);
        const memberInsufficientPermissions = this.getInsufficientPermissions(member, commandOptions.memberPermissions);

        if(MessageChannelHandler.getMessageChannel(message) === 'DM_COMMAND') {
            return this.checkPermissionsStatus(commandOptions.commandType.DMCommand, [], memberInsufficientPermissions);
        }

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
