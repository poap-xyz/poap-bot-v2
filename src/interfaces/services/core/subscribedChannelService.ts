import {SubscribedChannel} from "../../../models/core/subscribedChannel";
import {Snowflake, TextChannel} from "discord.js";
import {SubscribedChannelInput} from "../../../models/input/subscribedChannelInput";

export interface SubscribedChannelService{
    saveSubscribedChannel(subscribedChannel: SubscribedChannelInput);
    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void>;
    getSubscribedChannel(guildId: string | Snowflake, channelId: string | Snowflake): Promise<SubscribedChannel | null>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]>;
    getAllTextChannels(): TextChannel[];
    initSubscribersService();
}