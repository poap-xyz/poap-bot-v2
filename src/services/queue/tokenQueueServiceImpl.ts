import {TokenMetadata} from "../../models/poap/blockchain/tokenMetadata";
import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {Queue, Worker} from "bullmq";
import {TokenQueueService} from "../../interfaces/services/queue/tokenQueueService";
import {logger} from "../../logger";
@injectable()
export class TokenQueueServiceImpl implements TokenQueueService{
    private readonly redisClient: Redis;
    private queue: Queue;

    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisClient = redisClient;
        this.initTokenQueue();
    }

    private initTokenQueue(){
        this.queue = new Queue('token', { connection: this.redisClient });
    }

    async addTokenMetadataToQueue(token: TokenMetadata) {
        logger.debug(`Adding token ${JSON.stringify(token)} to queue`);
        await this.queue.add(token.id.toString(), token);
    }

    async addTokensMetadataToQueue(tokens: TokenMetadata[]) {
        for(let i = 0; i < tokens.length; i++){
            await this.addTokenMetadataToQueue(tokens[i]);
        }
    }

}