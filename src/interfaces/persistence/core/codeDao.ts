import {Code} from "../../../models/code";
import {CodeInput} from "../../../models/input/codeInput";
import {Event} from "../../../models/event";

export interface CodeDao{
    addCode(code: CodeInput): Promise<Code>;
    countTotalCodes(event_id: Code['event_id']): Promise<number>;
    /**
     * @method
     * Check if username has not claimed any code for the event before
     * @param {Event['id']} event_id
     * @param {string} username
     * @returns {Promise<boolean>} true if pass is correct and username has not claim yet
     */
    checkCodeForEventUsername(event_id: Event['id'], username: string);
    countClaimedCodes(event_id: Code['event_id']): Promise<number>;
}