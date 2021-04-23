import {TokenMetadata} from "../../models/poap/blockchain/tokenMetadata";
import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {Queue, QueueScheduler, Worker} from "bullmq";
import {TokenQueueService} from "../../interfaces/services/queue/tokenQueueService";
import {logger} from "../../logger";
@injectable()
export class TokenQueueServiceImpl implements TokenQueueService{
    private readonly redisClient: Redis;
    private queue: Queue;
    private queueScheduler: QueueScheduler;

    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisClient = redisClient;
        this.initTokenQueue();
    }

    private initTokenQueue(){
        this.queueScheduler = new QueueScheduler('token', {connection: this.redisClient});
        this.queue = new Queue('token', {
            connection: this.redisClient,
            limiter: {
                groupKey: 'tokenId',
            } });
    }

    async addTokenMetadataToQueue(token: TokenMetadata) {
        logger.debug(`Adding token ${JSON.stringify(token)} to queue`);
        await this.queue.add(token.id.toString(), token, {
            delay: 5000,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 10000,
            },
        });
    }

    async addTokensMetadataToQueue(tokens: TokenMetadata[]) {
        for(let i = 0; i < tokens.length; i++){
            await this.addTokenMetadataToQueue(tokens[i]);
        }
    }

}