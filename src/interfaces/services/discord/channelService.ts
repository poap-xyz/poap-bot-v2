import {Channel, DMChannel, Guild, GuildChannel, Message, Snowflake, TextChannel, User} from "discord.js";
import {logger} from "../../../logger";
import {DMChannelCallback} from "../../callback/DMChannelCallback";

export type ChannelType = 'DM_COMMAND' | 'GUILD_COMMAND' | 'UNKNOWN';

export interface ChannelService{

    getTextChannel(guildId: string, channelId: string): Promise<TextChannel>;

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