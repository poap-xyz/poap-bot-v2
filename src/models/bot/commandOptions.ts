import {PermissionResolvable} from "discord.js";
export type CommandType = {DMCommand: boolean, GuildCommand: boolean};

export interface CommandOptions{
    aliases: string[];
    memberPermissions: PermissionResolvable[];
    botPermissions: PermissionResolvable[];
    commandType: CommandType;
    disabled: boolean;
}