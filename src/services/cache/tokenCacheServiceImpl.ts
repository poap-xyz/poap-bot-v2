import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {Redis} from "ioredis";
import {TokenQueueService} from "../../interfaces/services/queue/tokenQueueService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {Token} from "../../models/poap/token";

@injectable()
export class TokenCacheServiceImpl implements TokenCacheService{
    private readonly redisClient: Redis;
    private readonly tokenQueueService: TokenQueueService;

    constructor(@inject(TYPES.Cache) redisClient: Redis, @inject(TYPES.TokenQueueService) tokenQueueService: TokenQueueService) {
        this.redisClient = redisClient;
        this.tokenQueueService = tokenQueueService;
    }
    async getTokenFromCache(tokenId: string | number): Promise<Token> {
        const token = await this.redisClient.hget("tokens", tokenId.toString());
        if(!token)
            return undefined;
        return JSON.parse(token);
    }

    async saveTokenInCache(token: Token) {
        const response = await this.redisClient.hset("tokens", token.tokenId, JSON.stringify(token));
        return token;
    }


}