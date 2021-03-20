import {Code} from "../../models/code";

export interface CodeDao{
    addCode(uuid: Code['id'], code: Code['code']): Promise<Code>;

    countTotalCodes(event_id: Code['event_id']): Promise<number>;

    countClaimedCodes(event_id: Code['event_id']): Promise<number>;
}