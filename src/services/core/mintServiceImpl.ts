import {MintService} from "../../interfaces/services/core/mintService";
import axios from "axios";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {TokenMetadata} from "../../models/poap/blockchain/tokenMetadata";
import {Redis} from "ioredis";
import {inject} from "inversify";
import {TYPES} from "../../config/types";
import {CodeInput} from "../../models/input/codeInput";



export class MintServiceImpl implements MintService{
    private static readonly POAP_API_ADDRESS_POAPS = BotConfig.poapCoreAPI + BotConfig.poapCoreScanAPIURI;
    private readonly redisClient: Redis;

    constructor(@inject(TYPES.Cache) redisClient: Redis) {
        this.redisClient = redisClient;
    }

    async cacheLastMintedPoaps() {
        const timestamp = await this.getLastOrDefaultTimestamp();
        const mintedxDaiPoaps = await MintServiceImpl.requestLastMintedPoapsByTimestamp(BotConfig.poapSubgraphxDai, timestamp);
        mintedxDaiPoaps.forEach((token) => {

        });

    }

    private async getLastOrDefaultTimestamp(): Promise<string>{
        const defaultTimestamp = new Date();
        defaultTimestamp.setHours(defaultTimestamp.getHours() - 20); //TODO remove this after testing, default date should be now
        try {
            const lastTimestamp = await this.getLastTimestamp();
            if(lastTimestamp)
                return lastTimestamp;
        }catch (err){
            logger.error(`[MintService] Error getting last timestamp in redis, error: ${err}`);
        }

        return defaultTimestamp.getTime().toString();
    }

    private getLastTimestamp(): Promise<string>{
        return new Promise<string>( (resolve, reject) => {
            this.redisClient.get("last_check_timestamp", function (err, reply) {
                if(err) {
                    reject(err);
                }
                resolve(reply);
            });
        });
    }

    private static async requestLastMintedPoapsByTimestamp(url: string, timestamp: number | string): Promise<TokenMetadata[]>{
        let last_id = 0;
        let mintedPoaps: TokenMetadata[] = [];
        do {
            try {

                const queryJSON = MintServiceImpl.getLastTokensByTimestampQuery(last_id, timestamp);
                const axiosResponse = await axios.post(url, JSON.stringify(queryJSON));

                const partialMintedPoaps: TokenMetadata[] = axiosResponse.data.tokens;
                last_id = MintServiceImpl.addTokensToListAndGetLastId(partialMintedPoaps, mintedPoaps);

                if(!last_id)
                    return mintedPoaps;
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
        logger.debug(`[MintService] Blockchain Thegraph response: ${partialMintedPoaps}`);
        if(partialMintedPoaps.length === 0)
            return undefined;

        allMintedPoaps.push(...partialMintedPoaps);
        return partialMintedPoaps[-1].id;
    }
}
