import {SubscribedChannel} from "../../../models/core/subscribedChannel";

export interface SubscribedChannelService{
    saveSubscribedChannel(subscribedChannel: SubscribedChannel);
    getAllSubscribedChannel(): Promise<SubscribedChannel[]> ;
}