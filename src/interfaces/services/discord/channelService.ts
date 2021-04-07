import {DMChannel, Guild, GuildChannel, Message, Snowflake, User} from "discord.js";
import {DMChannelCallback} from "../../callback/DMChannelCallback";
import {logger} from "../../../logger";

export type ChannelType = 'DM_COMMAND' | 'GUILD_COMMAND' | 'UNKNOWN';

export interface ChannelService{
    getChannelFromGuild(guild: Guild, channelId: string | Snowflake): GuildChannel;

    getChannelFromGuildByName(guild: Guild, channelName: string): GuildChannel;

    getChannelsArray(guild: Guild): string[];

    getChannelsString(guild: Guild): string;

    getMessageChannel(message: Message): ChannelType;

    createDMChannelWithHandler(user: User, dmChannelHandler: DMChannelCallback): Promise<DMChannel>;

    createUserDMChannel(user: User): Promise<DMChannel>;

    hasUserDMChannel(user: User): boolean;

    getUserDMChannel(user: User): DMChannel

    deleteUserDMChannel(user: User, reason?: string): Promise<void>

}