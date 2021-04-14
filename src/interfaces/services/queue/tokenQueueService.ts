import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";
import {Worker} from "bullmq";

export interface TokenQueueService {
    addTokenMetadataToQueue(token: TokenMetadata);
    addTokensMetadataToQueue(tokens: TokenMetadata[]);
}
