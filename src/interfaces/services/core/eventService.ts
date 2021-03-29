import {Event} from "../../../models/event";
import {EventInput} from "../../../models/input/eventInput";

export interface EventService{
    /**
     * @method
     * Get events held right now
     * @returns {Promise<Event[]>}
     */
    getRealtimeActiveEvents(): Promise<Event[]>;
    /**
     * @method
     * Get events held in the future
     * @returns {Promise<Event[]>}
     */
    getFutureActiveEvents(): Promise<Event[]>;
    /**
     * @method
     * Get all events
     * @returns {Promise<Event[]>}
     */
    getAllEvents(): Promise<Event[]>;
    /**
     * @method
     * Get all events from a specific Server or Server
     * @param {Event['server']} server
     * @returns {Promise<Event[]>}
     */
    getGuildEvents(server: Event['server']): Promise<Event[]>;
    /**
     * @method
     * Get all active events held right now from a specific Server or Server
     * @param {Event['server']} server
     * @returns {Promise<Event[]>}
     */
    getGuildActiveEvents(server: Event['server']): Promise<Event[]>;
    /**
     * @method
     * Get event using a specific pass
     * @param {string} messageContent
     * @returns {Promise<Event> | null} Array of Events usign the pass or null if pass does not exists
     */
    getEventFromPass(messageContent: string): Promise<Event | null>;
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
     * @param {Event} event to save
     * @param {string} username who is saving the Event
     * @returns {Promise<Event>} the saved Event
     */
    saveEvent(event: EventInput, username: string): Promise<Event>;

}