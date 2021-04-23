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
import {Web3Config} from "../../config/web3.config";
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
        logger.info(`[TokenWorkerService] Creating worker for Token Metadata`);
        const newWorker = new Worker<TokenMetadata, Token>('token',
            async (m) => await this.workerProcessor(m),
            {
                connection: this.redisClient,
                limiter: {
                    max: 50,
                    duration: 5000,
                    groupKey: 'tokenId'
                }
        });

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
        logger.debug(`[TokenWorkerService] Token metadata: ${JSON.stringify(tokenMetadata)}`);

        const account = await this.getAccount(tokenMetadata.to);
        const token = await this.getAndCacheTokenWithMetadata(tokenMetadata, account);
        logger.debug(`[TokenWorkerService] Token fetched: ${JSON.stringify(token)}`);

        if(!token)
            return Promise.reject("No token could be fetched");

        return token;
    }

    private async getAndCacheTokenWithMetadata(tokenMetadata: TokenMetadata, account?: Account): Promise<Token>{
        const token = await this.getToken(tokenMetadata, account);
        if(!token)
            return undefined;

        const tokenWithMetadata = TokenWorkerServiceImpl.addMetadataToToken(token, tokenMetadata);

        /* Cache token for further use */
        await this.saveTokenToCache(tokenWithMetadata);

        return tokenWithMetadata;
    }

    private static addMetadataToToken(token: Token, tokenMetadata: TokenMetadata){
        return {
            ...token,
            chain: tokenMetadata.chain,
            action: tokenMetadata.action
        }
    }

    private async saveTokenToCache(token: Token){
        try {
            await this.tokenCacheService.saveTokenInCache(token);
        }catch (e){
            logger.error(`[TokenWorkerService] Error saving token to cache, message: ${e}`);
            return Promise.reject(e);
        }
    }
    private async getToken(tokenMetadata: TokenMetadata, account?: Account): Promise<Token>{
        let token = this.getTokenFromAccount(tokenMetadata, account);
        if(token)
            return token;

        try{
            const token = await TokenWorkerServiceImpl.requestTokenFromAPI(tokenMetadata.id);
            await this.saveTokenToAccountCache(token, tokenMetadata);
            return token;
        }catch (e){
            logger.error(`[TokenWorkerService] GetToken error: ${e}`);
            return undefined;
        }
    }

    private getTokenFromAccount(token: TokenMetadata, account: Account): Token{
        if(!(account && account.tokens)){
            return undefined;
        }

        return account.tokens.find((value => value.tokenId === token.id));
    }

    private async saveTokenToAccountCache(token: Token, tokenMetadata: TokenMetadata): Promise<number>{
        const account = await this.accountCacheService.getAccountFromCache(token.owner);
        if(!(account && account.tokens))
            return undefined;

        account.tokens.push(TokenWorkerServiceImpl.addMetadataToToken(token, tokenMetadata));
        return await this.accountCacheService.saveAccountInCache(account);
    }

    private static async requestTokenFromAPI(tokenId: number): Promise<Token>{
        const tokenByIdApiUrl = Web3Config.poapCoreAPI + Web3Config.poapCoreTokenAPIURI + tokenId;
        try {
            const request = await axios.get(tokenByIdApiUrl);
            logger.debug(`[TokenWorkerService] Token from api request response ${JSON.stringify(request.data)}`);
            return <Token>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting token by id, URL: ${tokenByIdApiUrl}, error: ${e}`);
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
            const ensLookupApiUrl = Web3Config.poapCoreAPI + Web3Config.poapCoreENSLookupAPIURI + address;

            const request = await axios.get(ensLookupApiUrl);
            logger.debug(`[TokenWorkerService] ENS request response OK`); //${JSON.stringify(request.data)}

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
        const tokensByAddressApiUrl = Web3Config.poapCoreAPI + Web3Config.poapCoreScanAPIURI + address;
        try {
            const request = await axios.get(tokensByAddressApiUrl);
            logger.debug(`[TokenWorkerService] Request tokens by address response OK`); //${JSON.stringify(request.data)}
            return <Token[]>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting tokens in address, URL: ${tokensByAddressApiUrl}, error: ${e}`);
            return Promise.reject(e);
        }
    }

}