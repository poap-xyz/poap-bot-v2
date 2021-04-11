import {Account} from "../account";
import {EventMetadata} from "./eventMetadata";
import {AccountMetadata} from "./accountMetadata";

export interface TokenMetadata{
    id: number,
    event: EventMetadata,
    owner: AccountMetadata,
    created: Date,
}
