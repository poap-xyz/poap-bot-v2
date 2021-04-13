import {Account} from "../account";
import {EventMetadata} from "./eventMetadata";
import {AccountMetadata} from "./accountMetadata";

export type Chain = "XDAI" | "Mainnet";

export interface TokenMetadata{
    id: number,
    event: EventMetadata,
    owner: AccountMetadata,
    created: Date,
    chain: Chain,
}
