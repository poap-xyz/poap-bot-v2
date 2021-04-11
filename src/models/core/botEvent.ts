import {Code} from "./code";

export interface BotEvent {
    id: number;
    server: string;
    channel: string;
    start_date: Date;
    end_date: Date;
    response_message: string;
    pass: string;
    created_by: string;
    created_date: Date;
    file_url: string;
    is_active: boolean;
    is_whitelisted: boolean | null;
    whitelist_file_url: string | null;
    codes?: Code[];
}
