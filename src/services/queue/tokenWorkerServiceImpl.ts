import {Job, Worker} from "bullmq";
import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {TokenMetadata} from "../../models/poap/blockchain/tokenMetadata";
import {Token} from "../../models/poap/token";
import {logger} from "../../logger";
import {Account} from "../../models/poap/account";
import axios from "axios";
import {BotConfig} from "../../config/bot.config";
import {TokenWorkerService} from "../../interfaces/services/queue/tokenWorkerService";
import {PublisherService} from "../../interfaces/services/pubsub/publisherService";
import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../interfaces/services/cache/accountCacheService";
@injectable()
export class TokenWorkerServiceImpl implements TokenWorkerService{
    private readonly publisherService: PublisherService;
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;
    private readonly redisClient: Redis;
    private workers: Worker[];

    constructor(@inject(TYPES.PublisherService) publisherService: PublisherService,
                @inject(TYPES.TokenCacheService) tokenCacheService: TokenCacheService,
                @inject(TYPES.AccountCacheService) accountCacheService: AccountCacheService,
                @inject(TYPES.Cache) redisClient: Redis) {
        this.publisherService = publisherService;
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
        this.redisClient = redisClient;
        this.workers = [];
    }

    createWorker(): Worker {
        const newWorker = new Worker<TokenMetadata, Token>('token', async (m) => await this.workerProcessor(m), { connection: this.redisClient });
        newWorker.on("completed", async (job: Job, value: Token) => {
            /* Publish to all subscribers the new token */
            await this.publisherService.publishToTokenChannel(value.tokenId.toString());
        });
        newWorker.on("failed", (job: Job, failedReason: string) => {
            // Do something with the return value.
            logger.error(`[TokenWorkerService] Job ${JSON.stringify(job.data)}, failed. Reason: ${failedReason}`);
        });
        this.workers.push(newWorker);

        return newWorker;
    }

    private async workerProcessor(job: Job<TokenMetadata, Token>): Promise<Token>{
        const tokenMetadata: TokenMetadata = job.data;

        const account = await this.getAccount(tokenMetadata.to);
        logger.debug(`[TokenWorkerService] Account fetched: ${JSON.stringify(account)}`);

        const token = await this.getToken(tokenMetadata, account);
        logger.debug(`[TokenWorkerService] Token fetched: ${JSON.stringify(token)}`);

        if(!token)
            return Promise.reject("No token could be fetched");

        /* Cache token for further use */
        try {
            await this.tokenCacheService.saveTokenInCache(token);
        }catch (e){
            logger.error(`[TokenWorkerService] Error saving token to cache, message: ${e}`);
            return Promise.reject(e);
        }

        return token;
    }

    private async getToken(tokenMetadata: TokenMetadata, account?: Account): Promise<Token>{
        let token = this.getTokenFromAccount(tokenMetadata, account);
        if(token)
            return token;

        try{
            return await TokenWorkerServiceImpl.requestTokenFromAPI(tokenMetadata.id);
        }catch (e){
            return undefined;
        }
    }

    private getTokenFromAccount(token: TokenMetadata, account: Account): Token{
        if(!(account && account.tokens)){
            return undefined;
        }

        return account.tokens.find((value => value.tokenId === token.id));
    }

    private static async requestTokenFromAPI(tokenId: number): Promise<Token>{
        try {
            const tokenByIdApiUrl = BotConfig.poapCoreAPI + BotConfig.poapCoreTokenAPIURI + tokenId;
            const request = await axios.get(tokenByIdApiUrl);
            logger.debug(`[TokenWorkerService] token from api request response ${JSON.stringify(request.data)}`);
            return <Token>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting token by id, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private async getAccount(address: string): Promise<Account>{
        try {
            let cachedAccount = await this.getAccountCached(address);
            if (!cachedAccount){
                cachedAccount = await this.requestAndCacheAccount(address);
            }

            return cachedAccount;
        }catch (e){
            return undefined;
        }
    }

    private async getAccountCached(address: string): Promise<Account>{
        try {
            return await this.accountCacheService.getAccountFromCache(address);
        }catch (e){
            logger.error(`[TokenWorkerService] Error getting tokens in address cached, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private async requestAndCacheAccount(address: string): Promise<Account>{
        const tokens = await TokenWorkerServiceImpl.requestTokensByAddressFromAPI(address);
        const ens = await TokenWorkerServiceImpl.requestENSByAddress(address);
        const account: Account = {address: address, ens: ens, tokens: tokens};
        return await this.cacheAccount(account);
    }

    private async cacheAccount(account: Account): Promise<Account>{
        try{
            return await this.accountCacheService.saveAccountInCache(account);
        }catch (e){
            logger.error(`[TokenWorkerService] Error saving cache, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private static async requestENSByAddress(address: string): Promise<string>{
        try {
            const ensLookupApiUrl = BotConfig.poapCoreAPI + BotConfig.poapCoreENSLookupAPIURI + address;

            const request = await axios.get(ensLookupApiUrl);
            logger.debug(`[TokenWorkerService] ENS request response ${JSON.stringify(request.data)}`);

            const {valid, ens} = request.data;
            if(valid)
                return ens;

            return null;
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting ENS lookup in address, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private static async requestTokensByAddressFromAPI(address: string): Promise<Token[]>{
        try {
            const tokensByAddressApiUrl = BotConfig.poapCoreAPI + BotConfig.poapCoreScanAPIURI + address;
            const request = await axios.get(tokensByAddressApiUrl);
            logger.debug(`[TokenWorkerService] Request tokens by address response ${JSON.stringify(request.data)}`);
            return <Token[]>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting tokens in address, error: ${e}`);
            return Promise.reject(e);
        }
    }

}