import {Event} from "../event";
import {CodeInput} from "./codeInput";

export interface EventInput {
    server: Event['server'];
    channel: Event['channel'];
    start_date: Event['start_date'];
    end_date: Event['end_date'];
    response_message: Event['response_message'];
    pass: Event['pass'];
    created_by: Event['created_by'];
    created_date: Event['created_date'];
    file_url: Event['file_url'];
    is_whitelisted: Event['is_whitelisted'];
    whitelist_file_url: Event['whitelist_file_url'];
    codes?: CodeInput[];
}