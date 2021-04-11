import {Code} from "../../../models/core/code";
import {CodeInput} from "../../../models/input/codeInput";
import {BotEvent} from "../../../models/core/event";

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
    checkCodeForEventUsername(event_id: BotEvent['id'], username: string);

    countClaimedCodes(event_id: Code['event_id']): Promise<number>;
}