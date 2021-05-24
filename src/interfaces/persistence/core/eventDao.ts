import {BotEvent} from "../../../models/core/botEvent";
import {BotEventInput} from "../../../models/input/botEventInput";

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
     * Get event by id
     * @param {Event['id']} eventId
     * @returns {Promise<BotEvent[]>}
     */
    getEventById(eventId: BotEvent['id']): Promise<BotEvent>;
    /**
     * @method
     * Get event using a specific pass
     * @param {string} eventPass
     * @returns {Promise<BotEvent> | null} Event using the pass or null if pass does not exists
     */
    getEventByPass(eventPass: string): Promise<BotEvent | null>;
    /**
     * @method
     * Get active event using a specific pass
     * @param {string} eventPass
     * @returns {Promise<BotEvent> | null} Event using the pass or null if pass does not exists or event is inactive
     */
    getActiveEventByPass(eventPass: string): Promise<BotEvent | null>;
    /**
     * @method
     * Check if a pass is available to use in a new Event
     * @param {string} eventPass
     * @returns {Promise<boolean>} true if pass is available
     */
    isPassAvailable(eventPass: string): Promise<boolean>;
    /**
     * @method
     * Save event in DB
     * @param {BotEventInput} event to save
     * @returns {Promise<BotEvent>} the saved Event
     */
    saveEvent(event: BotEventInput): Promise<BotEvent>;
    /**
     * @method
     * Modify existing event in DB
     * @param {BotEvent} event to update
     * @returns {Promise<BotEvent>} the updated Event
     */
    updateEvent(event: BotEvent): Promise<BotEvent>
}
