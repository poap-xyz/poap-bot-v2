import {Account} from "./account";
import {PoapEvent} from "./poapEvent";
import {Chain} from "./blockchain/tokenMetadata";

export interface Token {
    tokenId: number,
    owner: string,
    event: PoapEvent,
    created?: Date,
    chain: Chain,
}
