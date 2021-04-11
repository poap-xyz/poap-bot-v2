import {BotEvent} from "../core/event";
import {CodeInput} from "./codeInput";

export interface EventInput {
    server: BotEvent['server'];
    channel: BotEvent['channel'];
    start_date: BotEvent['start_date'];
    end_date: BotEvent['end_date'];
    response_message: BotEvent['response_message'];
    pass: BotEvent['pass'];
    created_by: BotEvent['created_by'];
    created_date: BotEvent['created_date'];
    file_url: BotEvent['file_url'];
    is_whitelisted: BotEvent['is_whitelisted'];
    whitelist_file_url: BotEvent['whitelist_file_url'];
    codes?: CodeInput[];
}