import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {PublisherService} from "../../interfaces/services/pubsub/publisherService";
import {logger} from "../../logger";
@injectable()
export class PublisherServiceImpl implements PublisherService{
    private readonly redisPublisherClient: Redis;
    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisPublisherClient = redisClient.duplicate();
    }

    async publishToTokenChannel(message: string): Promise<number> {
        logger.debug(`Publishing to token channel, message: ${message}`);
        try{
            return await this.redisPublisherClient.publish("tokenChannelQueue", message);
        }catch (e){
            logger.error(`[PublisherService] Error publishing to channel tokenChannelQueue, message: ${e}`);
            return Promise.reject(e);
        }
    }
}