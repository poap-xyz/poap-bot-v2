import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";

export interface PublisherService {
    publishToTokenChannel(tokenId: string) : Promise<number>;
}
