import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";

export interface SubscriberService {
    subscribeToTokenChannel(callback: (message: string) => {}) : Promise<void>;
    unsubscribeToTokenChannel(): Promise<void>;
}
