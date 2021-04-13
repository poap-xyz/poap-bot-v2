import {TokenWorkerService} from "../../interfaces/services/core/tokenWorkerService";
import {Job, Worker} from "bullmq";
import {Redis} from "ioredis";
import {inject} from "inversify";
import {TYPES} from "../../config/types";
import {TokenMetadata} from "../../models/poap/blockchain/tokenMetadata";
import {Token} from "../../models/poap/token";
import {logger} from "../../logger";
import {Account} from "../../models/poap/account";

export class TokenWorkerServiceImpl implements TokenWorkerService{
    private readonly redisClient: Redis;
    private workers: Worker[];

    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisClient = redisClient;
        this.workers = [];
    }

    createWorker() {
        const newWorker = new Worker<TokenMetadata, Token>('token', this.workerProcessor, { connection: this.redisClient });
        newWorker.on("completed", (job: Job, value: Token) => {
            // Do something with the return value.
        });
        this.workers.push(newWorker);

        return newWorker;
    }

    private async workerProcessor(job: Job<TokenMetadata, Token>): Promise<Token>{

    }

    private async getTokensByAddressCached(address: string): Promise<Account>{
        try {
            const tokensInAddress = await this.redisClient.hget("tokensInAddress", address);
            if(tokensInAddress === "")
                return undefined;

            return JSON.parse(tokensInAddress);
        }catch (e){
            logger.error(`[TokenWorkerService] Error getting tokens in address cached, error: ${e}`);
            return Promise.reject(e);
        }
    }

}