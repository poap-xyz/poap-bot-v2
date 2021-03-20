import {Event} from "../../models/event";

export interface EventDao{
    getRealtimeActiveEvents(): Promise<Event[]>;

    getFutureActiveEvents(): Promise<Event[]>;

    getAllEvents(): Promise<Event[]>;

    getGuildEvents(server: Event['server']): Promise<Event[]>;

    getGuildActiveEvents(server: Event['server']): Promise<Event[]>;

    getEventFromPass(messageContent: string): Promise<Event | null>;

    isPassAvailable(messageContent: string): Promise<boolean>;

    checkCodeForEventUsername(event_id: Event['id'], username: string);

    saveEvent(event: Event, username: string): Promise<Event>;

}