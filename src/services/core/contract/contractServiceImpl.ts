import {ContractService} from "../../../interfaces/services/core/contract/contractService";
import axios from "axios";
import {logger} from "../../../logger";
import {BotConfig} from "../../../config/bot.config";
import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";
import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../config/types";
import {TokenQueueService} from "../../../interfaces/services/queue/tokenQueueService";
import { Token } from "../../../models/poap/token";
import {PublisherService} from "../../../interfaces/services/pubsub/publisherService";
import {TokenCacheService} from "../../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../../interfaces/services/cache/accountCacheService";
import {Worker} from "bullmq";

@injectable()
export class ContractServiceImpl implements ContractService {
    private readonly tokenQueueService: TokenQueueService;
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;

    constructor(@inject(TYPES.TokenQueueService) tokenQueueService: TokenQueueService,
                @inject(TYPES.TokenCacheService) tokenCacheService: TokenCacheService,
                @inject(TYPES.AccountCacheService) accountCacheService: AccountCacheService) {
        this.tokenQueueService = tokenQueueService;
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
    }
    
    async initListener() {

    }

}
