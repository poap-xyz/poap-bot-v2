import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {Redis} from "ioredis";
import {TokenQueueService} from "../../interfaces/services/queue/tokenQueueService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {Token} from "../../models/poap/token";
import {AccountCacheService} from "../../interfaces/services/cache/accountCacheService";
import {Account} from "../../models/poap/account";

@injectable()
export class AccountCacheServiceImpl implements AccountCacheService{
    private readonly redisClient: Redis;
    private readonly tokenQueueService: TokenQueueService;

    constructor(@inject(TYPES.Cache) redisClient: Redis, @inject(TYPES.TokenQueueService) tokenQueueService: TokenQueueService) {
        this.redisClient = redisClient;
        this.tokenQueueService = tokenQueueService;
    }

    async getAccountFromCache(address: string): Promise<Account> {
        const account = await this.redisClient.hget("accounts", address);
        if(!account)
            return undefined;
        return JSON.parse(account);
    }

    async saveAccountInCache(account: Account) {
        const response = await this.redisClient.set("accounts", JSON.stringify(account));
        if(response !== "OK")
            return Promise.reject(response);
        return account;
    }

}