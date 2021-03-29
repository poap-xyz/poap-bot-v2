import {Code} from "../code";

export interface CodeInput {
    code: Code['code'];
    event_id?: Code['event_id'];
    created_date: Code['created_date'];
}