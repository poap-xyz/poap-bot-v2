import {SubscribedChannel} from "../../../models/core/subscribedChannel";

export interface SubscribedChannelDao{
    saveSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<SubscribedChannel>;
    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]>;
}