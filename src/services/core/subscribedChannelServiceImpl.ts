import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {inject, injectable} from "inversify";
import {CodeDao} from "../../interfaces/persistence/core/codeDao";
import {TYPES} from "../../config/types";
import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";

@injectable()
export class SubscribedChannelServiceImpl implements SubscribedChannelService{
    private subscribedChannelDao: SubscribedChannelDao;

    constructor(@inject(TYPES.SubscribedChannelDao) subscribedChannelDao: SubscribedChannelDao) {
        this.subscribedChannelDao = subscribedChannelDao;
    }

    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void> {
        return this.subscribedChannelDao.deleteSubscribedChannel(subscribedChannel);
    }

    getAllSubscribedChannel(): Promise<SubscribedChannel[]> {
        return this.subscribedChannelDao.getAllSubscribedChannel();
    }

    saveSubscribedChannel(subscribedChannel: SubscribedChannel) {
        return this.subscribedChannelDao.saveSubscribedChannel(subscribedChannel);
    }

}