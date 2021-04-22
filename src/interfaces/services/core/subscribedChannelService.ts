import {SubscribedChannel} from "../../../models/core/subscribedChannel";

export interface SubscribedChannelService{
    saveSubscribedChannel(subscribedChannel: SubscribedChannel);
    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void>;
    getAllSubscribedChannel(): Promise<SubscribedChannel[]> ;
}