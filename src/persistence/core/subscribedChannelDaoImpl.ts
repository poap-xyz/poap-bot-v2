import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";
import {inject, injectable} from "inversify";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {BotEvent} from "../../models/core/botEvent";
import {SubscribedChannelInput} from "../../models/input/subscribedChannelInput";

@injectable()
export class SubscribedChannelDaoImpl implements SubscribedChannelDao{
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.DB) db){
        this.db = db;
    }

    async getAllSubscribedChannel(): Promise<SubscribedChannel[]> {
        return await this.db.any<SubscribedChannel>("SELECT * FROM subscribed_channels;");
    }

    async saveSubscribedChannel(subscribedChannel: SubscribedChannelInput): Promise<SubscribedChannel> {
        return await this.db.one<SubscribedChannel>(
            "INSERT INTO subscribed_channels_token " +
            "(server, channel, is_active, xdai) " +
            "VALUES ( $1, $2, $3, $4) " +
            "RETURNING id, server, channel, is_active, xdai;",
            [subscribedChannel.server, subscribedChannel.channel, true, subscribedChannel.xDai]
        );
    }

    deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void> {
        return Promise.resolve(undefined);
    }

}