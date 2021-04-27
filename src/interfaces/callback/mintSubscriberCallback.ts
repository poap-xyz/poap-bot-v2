export interface MintSubscriberCallback {
    callback(tokenId: string): Promise<void>;
}