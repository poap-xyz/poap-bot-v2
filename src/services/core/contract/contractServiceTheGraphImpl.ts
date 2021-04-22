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

@injectable()
export class ContractServiceTheGraphImpl implements ContractService {
    private readonly redisClient: Redis;
    private readonly tokenQueueService: TokenQueueService;

    constructor(@inject(TYPES.Cache) redisClient: Redis, @inject(TYPES.TokenQueueService) tokenQueueService: TokenQueueService) {
        this.redisClient = redisClient;
        this.tokenQueueService = tokenQueueService;
    }
    async getTokenFromCache(tokenId: string | number): Promise<Token> {
        return JSON.parse(await this.redisClient.hget("tokens", tokenId.toString()));
    }

    async getAccountFromCache(address: string): Promise<Account> {
        return JSON.parse(await this.redisClient.hget("accounts", address));
    }

    async initListener() {
        //add a cron job here
        const timestamp = await this.getLastOrDefaultTimestamp();
        const mintedxDaiPoaps = await this.requestLastMintedPoapsByTimestamp(BotConfig.poapSubgraphxDai, timestamp);
        this.tokenQueueService.addTokensMetadataToQueue(mintedxDaiPoaps);
    }

    private async getLastOrDefaultTimestamp(): Promise<string>{
        const defaultTimestamp = new Date();
        try {
            const lastTimestamp = await this.getLastTimestamp();
            if(lastTimestamp)
                return lastTimestamp;
        }catch (err){
            logger.error(`[MintService] Error getting last timestamp in redis, error: ${err}`);
        }

        return Math.floor(defaultTimestamp.getTime() / 1000).toString();
    }

    private async getLastTimestamp(): Promise<string>{
        try {
            const timestamp = await this.redisClient.get("lastBlockchainPeekTimestamp");
            if(timestamp === "")
                return undefined;

            return timestamp;
        }catch (e){
            logger.error(`[MintService] Error getting timestamp, error: ${e}`);
            return Promise.reject(e);
        }
    }

    private async requestLastMintedPoapsByTimestamp(url: string, timestamp: number | string): Promise<TokenMetadata[]>{
        let last_id = 0;
        let mintedPoaps: TokenMetadata[] = [];
        do {
            try {
                const queryJSON = ContractServiceTheGraphImpl.getLastTokensByTimestampQuery(last_id, timestamp);
                const stringifiedQuery = JSON.stringify(queryJSON);
                const axiosResponse = await axios.post(url, stringifiedQuery);
                logger.debug(`[MintService] Blockchain Thegraph query: ${stringifiedQuery}, response: ${JSON.stringify(axiosResponse.data)}`);

                const partialMintedPoaps: TokenMetadata[] = axiosResponse.data && axiosResponse.data.data && axiosResponse.data.data.tokens;
                last_id = ContractServiceTheGraphImpl.addTokensToListAndGetLastId(partialMintedPoaps, mintedPoaps);

                if(!last_id){
                    await this.setLastTimestamp();
                    return mintedPoaps;
                }
            } catch (e) {
                logger.error(`[MintService] Error fetching blockchain, error: ${e}`);
                return Promise.reject(e);
            }
        } while(true);
    }

    private static getLastTokensByTimestampQuery(last_id: number, timestamp: number | string){
        const searchQuery = "{ tokens(first: 1000, where: { id_gt: \"" + last_id + "\", created_gte: \"" + timestamp + "\" } orderBy: id, orderDirection: asc) " +
            "{ id created owner {id} event {id, created} } }";
       return {"query": searchQuery};
    }

    private static addTokensToListAndGetLastId(partialMintedPoaps: TokenMetadata[], allMintedPoaps: TokenMetadata[]): number{
        if(!partialMintedPoaps || partialMintedPoaps.length === 0)
            return undefined;

        allMintedPoaps.push(...partialMintedPoaps);
        return partialMintedPoaps[partialMintedPoaps.length - 1].id;
    }

    private async setLastTimestamp(){
        try {
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000).toString();

            const response = await this.redisClient.set("lastBlockchainPeekTimestamp", timestamp);
            if(response !== "OK")
                return undefined;

            return timestamp;
        }catch (e){
            logger.error(`[MintService] Error setting timestamp, error: ${e}`);
            return Promise.reject(e);
        }
    }
}
