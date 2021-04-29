import {Code} from "../../../models/core/code";
import {CodeInput} from "../../../models/input/codeInput";
import {BotEvent} from "../../../models/core/botEvent";

export interface CodeService{
    /**
     * @method
     * Add code to an specific event
     * @param {CodeInput} code to add
     * @returns {Promise<Code>} The code saved in db
     */
    addCode(code: CodeInput): Promise<Code>;

    /**
     * @method
     * Add codes to an specific event
     * @param {CodeInput[]} codes to add
     * @returns {Promise<Code>} The codes saved in db
     */
    addCodes(codes: CodeInput[]): Promise<Code[]>;

    /**
     * @method
     * Delete code
     * @param {Code['code']} code to delete
     * @returns {Promise<void>}
     */
    deleteCode(code: Code['code']): Promise<void>;

    /**
     * @method
     * Delete all codes of an specific event
     * @param {Code['event_id']} event_id of the event to purge codes
     * @returns {Promise<void>}
     */
    deleteCodesByEvent(event_id: Code['event_id']): Promise<void>;

    /**
     * @method
     * Count all codes for an event
     * @param {Event['id']} event_id
     * @returns {Promise<number>} the number of codes for the event
     */
    countTotalCodes(event_id: Code['event_id']): Promise<number>;

    /**
     * @method
     * Check if username has not claimed any code for the event before
     * @param {Event['id']} event_id
     * @param {string} username
     * @returns {Promise<boolean>} true if pass is correct and username has not claim yet
     */
    checkCodeForEventUsername(event_id: BotEvent['id'], username: string);

    /**
     * @method
     * Count all claimed codes for an event
     * @param {Event['id']} event_id
     * @returns {Promise<number>} the number of claimed codes for the event
     */
    countClaimedCodes(event_id: Code['event_id']): Promise<number>;

    /**
     * @method
     * Check if a pass is correct and username has not claimed any before
     * @param {Event['id']} event_id
     * @param {string} username
     * @returns {Promise<boolean>} true if pass is correct and username has not claim yet
     */
    checkCodeForEventUsername(event_id: BotEvent['id'], username: string);
}
