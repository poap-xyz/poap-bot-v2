import {Channel, TextChannel} from "discord.js";
import {SubscriberCallback} from "../../callback/subscriberCallback";

export interface MintChannelService{
    initSubscribers();
    addChannelToMint(channel: Channel);
    getSubscriberCallback(): SubscriberCallback;
    getSubscribedChannels(): TextChannel[];
}