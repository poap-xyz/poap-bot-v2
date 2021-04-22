import {Token} from "../../../models/poap/token";

export interface TokenCacheService{
    getTokenFromCache(tokenId: number | string): Promise<Token>;
    saveTokenInCache(token: Token);
}