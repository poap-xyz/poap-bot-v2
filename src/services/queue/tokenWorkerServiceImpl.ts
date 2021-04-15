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
@injectable()
export class TokenWorkerServiceImpl implements TokenWorkerService{
    private readonly publisherService: PublisherService;
    private readonly redisClient: Redis;
    private workers: Worker[];

    constructor(@inject(TYPES.Cache) redisClient: Redis,
                @inject(TYPES.PublisherService) publisherService: PublisherService) {
        this.redisClient = redisClient;
        this.publisherService = publisherService;
        this.workers = [];
    }

    createWorker(): Worker {
        const newWorker = new Worker<TokenMetadata, Token>('token', this.workerProcessor, { connection: this.redisClient });
        newWorker.on("completed", async (job: Job, value: Token) => {
            /* Publish to all subscribers the new token */
            await this.publisherService.publishToTokenChannel(value.tokenId.toString());
        });
        this.workers.push(newWorker);

        return newWorker;
    }

    private async workerProcessor(job: Job<TokenMetadata, Token>): Promise<Token>{
        const tokenMetadata: TokenMetadata = job.data;
        const account = await this.getAccount(tokenMetadata.owner.id);
        const token = await this.getToken(tokenMetadata, account);
        if(!token)
            return Promise.reject("No token could be fetched");

        /* Cache token for further use */
        try {
            await this.redisClient.hset("tokens", token.tokenId, JSON.stringify(token));
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
            return <Token>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting token by id, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private async getAccount(address: string): Promise<Account>{
        try {
            let cachedAccount = this.getAccountCached(address);
            if (!cachedAccount)
                cachedAccount = this.requestAndCacheAccount(address);

            return cachedAccount;
        }catch (e){
            return undefined;
        }
    }

    private async getAccountCached(address: string): Promise<Account>{
        try {
            const tokensInAddress = await this.redisClient.hget("accounts", address);
            if(tokensInAddress === "")
                return undefined;

            return JSON.parse(tokensInAddress);
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
            await this.redisClient.hset("accounts", account.address, JSON.stringify(account));
            return account;
        }catch (e){
            logger.error(`[TokenWorkerService] Error saving cache, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private static async requestENSByAddress(address: string): Promise<string>{
        try {
            const ensLookupApiUrl = BotConfig.poapCoreAPI + BotConfig.poapCoreENSLookupAPIURI + address;
            const request = await axios.get(ensLookupApiUrl);

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
            return <Token[]>(request.data);
        }catch (e){
            logger.error(`[TokenWorkerService] Error requesting tokens in address, error: ${e}`);
            return Promise.reject(e);
        }
    }

}