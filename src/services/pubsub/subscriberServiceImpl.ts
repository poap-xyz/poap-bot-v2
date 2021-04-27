import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {logger} from "../../logger";
import {MintSubscriberCallback} from "../../interfaces/callback/mintSubscriberCallback";
import {SubscriberService} from "../../interfaces/services/pubsub/subscriberService";
@injectable()
export class SubscriberServiceImpl implements SubscriberService{
    private readonly redisSubscriberClient: Redis;
    private readonly subscriptions: Map<string, Redis>;

    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisSubscriberClient = redisClient;
        this.subscriptions = new Map();
    }

    subscribeToTokenChannel(subscriberCallback: MintSubscriberCallback): Promise<void> {
        return this.subscribeAndAddCallbackToChannel("tokenChannelQueue", subscriberCallback);
    }

    private async subscribeAndAddCallbackToChannel(channelName, subscriberCallback: MintSubscriberCallback): Promise<void> {
        try{
            const redisSubscriber = await this.subscribeToChannel(channelName);
            this.addCallbackToChannel(channelName, redisSubscriber, subscriberCallback);
            this.subscriptions.set(channelName, redisSubscriber);
        }catch (e){
            return Promise.reject(e);
        }
    }

    private subscribeToChannel(channelName: string): Promise<Redis>{
        return new Promise<Redis>((resolve, reject) => {
            let subscribedClient = this.subscriptions.get(channelName);
            if(subscribedClient)
                resolve(subscribedClient);

            const newSubscriberClient = this.redisSubscriberClient.duplicate();
            newSubscriberClient.subscribe(channelName, (err, count) => {
                if (err) {
                    logger.error(`[SubscriberService] Failed to subscribe: ${err.message}` );
                    return reject(err);
                }
                logger.info(`[SubscriberService] Subscribed successfully to ${count} channels`)
                return resolve(newSubscriberClient);
            });
        });
    }

    private addCallbackToChannel(channelName: string, subscriberClient: Redis, subscriberCallback: MintSubscriberCallback): Redis{
        return subscriberClient.on("message", (channel, message) => {
            if(channel === channelName)
                subscriberCallback.callback(message);
            else
                logger.error(`[SubscriberService] Attempting to publish message in ${channel} but ${channelName}.`);
        });
    }

    async unsubscribeToTokenChannel(): Promise<void> {
        await this.unsubscribeToChannel("tokenChannelQueue");
    }

    private async unsubscribeToChannel(channelName: string): Promise<number>{
        const channelSubscription: Redis = this.subscriptions.get(channelName);
        if(!channelSubscription)
            return Promise.reject(`No channel subscription with name ${channelName}`);
        return await channelSubscription.unsubscribe(channelName);
    }

}