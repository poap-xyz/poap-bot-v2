import {Event} from "./event";

export interface Code{
    id: number;
    code: string;
    event_id: Event['id'];
    username: string;
    is_active: boolean;
    claimed_date: Date | null;
    created_date: Date;
}
