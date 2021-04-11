import {BotEvent} from "../../../models/core/botEvent";
import {EventInput} from "../../../models/input/eventInput";

export interface EventDao{
    /**
     * @method
     * Get events held right now
     * @returns {Promise<BotEvent[]>}
     */
    getRealtimeActiveEvents(): Promise<BotEvent[]>;
    /**
     * @method
     * Get events held in the future
     * @returns {Promise<BotEvent[]>}
     */
    getFutureActiveEvents(): Promise<BotEvent[]>;
    /**
     * @method
     * Get all events
     * @returns {Promise<BotEvent[]>}
     */
    getAllEvents(): Promise<BotEvent[]>;
    /**
     * @method
     * Get all events from a specific Server or Server
     * @param {Event['server']} server
     * @returns {Promise<BotEvent[]>}
     */
    getGuildEvents(server: BotEvent['server']): Promise<BotEvent[]>;
    /**
     * @method
     * Get all active events held right now from a specific Server or Server
     * @param {Event['server']} server
     * @returns {Promise<BotEvent[]>}
     */
    getGuildActiveEvents(server: BotEvent['server']): Promise<BotEvent[]>;
    /**
     * @method
     * Get all events from a specific user
     * @param {Event['created_by']} user
     * @returns {Promise<BotEvent[]>}
     */
    getUserEvents(user: BotEvent['created_by']): Promise<BotEvent[]>;
    /**
     * @method
     * Get all active events held right now from a specific User
     * @param {Event['created_by']} user
     * @returns {Promise<BotEvent[]>}
     */
    getUserActiveEvents(user: BotEvent['created_by']): Promise<BotEvent[]>;
    /**
     * @method
     * Get event using a specific pass
     * @param {string} messageContent
     * @returns {Promise<BotEvent> | null} Array of Events using the pass or null if pass does not exists
     */
    getEventFromPass(messageContent: string): Promise<BotEvent | null>;
    /**
     * @method
     * Check if a pass is available to use in a new Event
     * @param {string} messageContent
     * @returns {Promise<boolean>} true if pass is available
     */
    isPassAvailable(messageContent: string): Promise<boolean>;
    /**
     * @method
     * Check if a pass is available to use in a new Event
     * @param {EventInput} event to save
     * @returns {Promise<BotEvent>} the saved Event
     */
    saveEvent(event: EventInput): Promise<BotEvent>;

}
