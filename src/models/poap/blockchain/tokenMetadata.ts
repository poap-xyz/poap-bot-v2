import {EventMetadata} from "./eventMetadata";
import {AccountMetadata} from "./accountMetadata";

export type Chain = "XDAI" | "Mainnet";

export interface TokenMetadata{
    id: number,
    event: number,
    to: string,
    from: string,
    chain: Chain,
}
