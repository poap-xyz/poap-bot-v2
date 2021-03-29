import {Code} from "../../../models/code";
import {CodeInput} from "../../../models/input/codeInput";
import {Event} from "../../../models/event";

export interface CodeService{
    addCode(code: CodeInput): Promise<Code>;

    addCodes(codes: CodeInput[]): Promise<Code[]>;

    countTotalCodes(event_id: Code['event_id']): Promise<number>;

    countClaimedCodes(event_id: Code['event_id']): Promise<number>;

    /**
     * @method
     * Check if a pass is correct and username has not claimed any before
     * @param {Event['id']} event_id
     * @param {string} username
     * @returns {Promise<boolean>} true if pass is correct and username has not claim yet
     */
    checkCodeForEventUsername(event_id: Event['id'], username: string);
}