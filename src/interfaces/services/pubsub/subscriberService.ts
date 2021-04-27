import {MintSubscriberCallback} from "../../callback/mintSubscriberCallback";

export interface SubscriberService {
    subscribeToTokenChannel(subscriberCallback: MintSubscriberCallback) : Promise<void>;
    unsubscribeToTokenChannel(): Promise<void>;
}
