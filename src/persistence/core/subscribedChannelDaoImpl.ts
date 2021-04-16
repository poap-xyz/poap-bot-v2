import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";
import {inject, injectable} from "inversify";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {BotEvent} from "../../models/core/botEvent";

@injectable()
export class SubscribedChannelDaoImpl implements SubscribedChannelDao{
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.DB) db){
        this.db = db;
    }

    async getAllSubscribedChannel(): Promise<SubscribedChannel[]> {
        return await this.db.any<SubscribedChannel>("SELECT * FROM subscribed_channels;");
    }

    saveSubscribedChannel(subscribedChannel: SubscribedChannel) {
    }

}