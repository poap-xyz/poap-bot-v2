import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";
import {inject, injectable} from "inversify";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {ExtendedProtocol, TYPES} from "../../config/types";
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
            "(server, channel, mainnet, xdai) " +
            "VALUES ( $1, $2, $3, $4) " +
            "RETURNING id, server, channel, mainnet, xdai;",
            [subscribedChannel.server, subscribedChannel.channel, true, subscribedChannel.xDai]
        );
    }

    async deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void> {
        return await this.db.none(
            "DELETE FROM subscribed_channels_token " +
            "WHERE server::text = $1 AND guild::text = $2 ",
            [subscribedChannel.server, subscribedChannel.channel]
        );
    }

}