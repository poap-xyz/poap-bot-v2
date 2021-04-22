import {Token} from "../../../models/poap/token";
import {Account} from "../../../models/poap/account";

export interface AccountCacheService{
    getAccountFromCache(address: string): Promise<Account>;
    saveAccountInCache(account: Account);
}