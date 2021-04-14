import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";
import {SubscriberCallback} from "../../callback/subscriberCallback";

export interface PublisherService {
    publishToTokenChannel(message: string) : Promise<number>;
}
