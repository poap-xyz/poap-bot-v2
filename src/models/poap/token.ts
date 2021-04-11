import {Account} from "./account";

export interface Token {
    id: number,
    owner: string,
    event: Event,
    created: Date,
}
