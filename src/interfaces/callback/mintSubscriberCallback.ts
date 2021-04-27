export interface MintSubscriberCallback {
    callback(message: string): Promise<void>;
}