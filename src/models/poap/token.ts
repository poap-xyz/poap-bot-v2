import {PoapEvent} from "./poapEvent";
import {Chain} from "./blockchain/chainType";

export interface Token {
    tokenId: number,
    owner: string,
    event: PoapEvent,
    created?: Date,
    chain: Chain,
}
