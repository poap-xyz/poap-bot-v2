import {SubscribedChannel} from "../../../models/core/subscribedChannel";
import {SubscribedChannelInput} from "../../../models/input/subscribedChannelInput";
import {Snowflake} from "discord.js";

export interface SubscribedChannelDao{
    saveSubscribedChannel(subscribedChannel: SubscribedChannelInput): Promise<SubscribedChannel>;
    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void>;
    getSubscribedChannel(guildId: string | Snowflake, channelId: string | Snowflake): Promise<SubscribedChannel | null>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]>;
}