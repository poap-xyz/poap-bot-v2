import {Token} from "./token";

export interface Account {
    address: string,
    ens?: string,
    tokens?: Token[],
}
