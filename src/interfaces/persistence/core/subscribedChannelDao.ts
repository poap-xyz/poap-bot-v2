import {SubscribedChannel} from "../../../models/core/subscribedChannel";

export interface SubscribedChannelDao{
    saveSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<SubscribedChannel>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]>;
}