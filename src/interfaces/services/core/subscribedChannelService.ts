import {SubscribedChannel} from "../../../models/core/subscribedChannel";
import {TextChannel} from "discord.js";

export interface SubscribedChannelService{
    saveSubscribedChannel(subscribedChannel: SubscribedChannel);
    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]>;
    getAllTextChannels(): TextChannel[];
    initSubscribersService();
}