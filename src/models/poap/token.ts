import {PoapEvent} from "./poapEvent";
import {Chain} from "./blockchain/chainType";
import {Action} from "./blockchain/actionType";

export interface Token {
    tokenId: number,
    owner: string,
    event: PoapEvent,
    created: Date,
    chain: Chain,
    action: Action,
}
