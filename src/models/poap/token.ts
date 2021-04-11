import {Account} from "./account";

export interface Token{
    id: number,
    owner: Account,
    event: Event,
}