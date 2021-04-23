import {ContractService} from "../../../interfaces/services/core/contract/contractService";
import axios from "axios";
import {logger} from "../../../logger";
import {BotConfig} from "../../../config/bot.config";
import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";
import {Redis} from "ioredis";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../config/types";
import {TokenQueueService} from "../../../interfaces/services/queue/tokenQueueService";
import {TokenCacheService} from "../../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../../interfaces/services/cache/accountCacheService";
import {PoapAbi} from "../../../config/poap.abi";
import Web3 from 'web3';
import {Web3Config} from "../../../config/web3.config";
import {Chain} from "../../../models/poap/blockchain/chainType";
import {Action} from "../../../models/poap/blockchain/actionType";

@injectable()
export class ContractServiceImpl implements ContractService {
    private readonly tokenQueueService: TokenQueueService;
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;

    private readonly xDaiWeb3Provider: string;
    private readonly mainnetWeb3Provider: string;

    constructor(@inject(TYPES.TokenQueueService) tokenQueueService: TokenQueueService,
                @inject(TYPES.TokenCacheService) tokenCacheService: TokenCacheService,
                @inject(TYPES.AccountCacheService) accountCacheService: AccountCacheService,
                @inject(TYPES.ProviderXDai) xDaiWeb3Provider: string,
                @inject(TYPES.ProviderMainnet) mainnetWeb3Provider: string
    ) {
        this.tokenQueueService = tokenQueueService;
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
        this.xDaiWeb3Provider = xDaiWeb3Provider;
        this.mainnetWeb3Provider = mainnetWeb3Provider;
    }

    initListener() {
        const web3xDai = this.subscribeToTransfer(this.xDaiWeb3Provider, Web3Config.poapContract, "XDAI");
        const web3Mainnet = this.subscribeToTransfer(this.mainnetWeb3Provider, Web3Config.poapContract, "Mainnet");
    }

    private subscribeToTransfer(provider: string, address: string, network: Chain){
        const web3 = new Web3(
            new Web3.providers.WebsocketProvider(provider, Web3Config.WSOptions)
        );

        const PoapContract = new web3.eth.Contract(PoapAbi, address);

        logger.info(`[ContractService] Subscribing to ${network} - ${address} `);
        PoapContract.events.Transfer(null)
            .on("data", async (result) => {
                logger.debug(`[ContractService] Transfer data ${JSON.stringify(result)}`);

                const tokenInfo: TokenMetadata = {
                    id: result.returnValues.tokenId,
                    to: result.returnValues.to,
                    from: result.returnValues.from,
                    action: ContractServiceImpl.getTokenAction(result.returnValues.from, result.returnValues.to),
                    chain: network,
                };

                await this.tokenQueueService.addTokenMetadataToQueue(tokenInfo);
            })
            .on("connected", (subscriptionId) => {
                logger.info(`[ContractService] Connected to ${network} - ${subscriptionId} `);
            })
            .on("changed", (log) => {
                logger.info(`[ContractService] Changed to ${network} - ${log} `);
            })
            .on("error", (error) => {
                logger.info(`[ContractService] Error to ${network} - ${error} `);
            });

        return web3;
    }

    private static getTokenAction(from: string, to: string): Action{
        if(from === Web3Config.zeroAddress)
            return "MINT";

        if(to === Web3Config.zeroAddress)
            return "BURN";

        return "TRANSFER";
    }
}
