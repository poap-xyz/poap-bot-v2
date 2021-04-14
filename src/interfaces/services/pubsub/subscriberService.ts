import {SubscriberCallback} from "../../callback/subscriberCallback";

export interface SubscriberService {
    subscribeToTokenChannel(subscriberCallback: SubscriberCallback) : Promise<void>;
    unsubscribeToTokenChannel(): Promise<void>;
}
