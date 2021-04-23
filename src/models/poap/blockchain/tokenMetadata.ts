import {Action} from "./actionType";
import {Chain} from "./chainType";

export interface TokenMetadata{
    id: number,
    to: string,
    from: string,
    action: Action,
    chain: Chain,
}
