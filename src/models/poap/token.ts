import {Account} from "./account";
import {PoapEvent} from "./poapEvent";

export interface Token {
    id: number,
    owner: string,
    event: PoapEvent,
    created: Date,
}
