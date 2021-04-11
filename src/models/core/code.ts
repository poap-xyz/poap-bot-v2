import {BotEvent} from "./botEvent";

export interface Code{
    id: number;
    code: string;
    event_id: BotEvent['id'];
    username: string;
    is_active: boolean;
    claimed_date: Date | null;
    created_date: Date;
}
