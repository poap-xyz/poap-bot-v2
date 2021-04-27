import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";
import {inject, injectable} from "inversify";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {SubscribedChannelInput} from "../../models/input/subscribedChannelInput";
import {Snowflake} from "discord.js";

@injectable()
export class SubscribedChannelDaoImpl implements SubscribedChannelDao{
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.DB) db){
        this.db = db;
    }

    async getAllSubscribedChannel(): Promise<SubscribedChannel[]> {
        return await this.db.any<SubscribedChannel>("SELECT * FROM subscribed_channels_token;");
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
        return await this.db.none("DELETE FROM subscribed_channels_token WHERE id = $1", [subscribedChannel.id]);
    }

    getSubscribedChannel(guildId: string | Snowflake, channelId: string | Snowflake): Promise<SubscribedChannel | null> {
        return this.db.oneOrNone<SubscribedChannel>("SELECT * FROM subscribed_channels_token WHERE server::text = $1 AND channel::text = $2;", [guildId, channelId]);
    }

}