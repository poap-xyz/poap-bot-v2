import {Token} from "../../../models/poap/token";

export interface MintService{
    cacheLastMintedTokens();
    getTokenFromCache(tokenId: number | string): Promise<Token>;
    getAccountFromCache(address: string): Promise<Account>;
}
