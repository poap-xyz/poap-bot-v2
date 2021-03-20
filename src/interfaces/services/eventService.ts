import {Event} from "../../models/event";

export interface EventService{
    getRealtimeActiveEvents(): Promise<Event[]>;

    getFutureActiveEvents(): Promise<Event[]>;

    getAllEvents(): Promise<Event[]>;

    getGuildEvents(server: Event['server']): Promise<Event[]>;

    getGuildActiveEvents(server: Event['server']): Promise<Event[]>;

    getEventFromPass(messageContent: string): Promise<Event | null>;

    checkCodeForEventUsername(event_id: Event['id'], username: string);

    saveEvent(event: Event, username: string): Promise<Event>;

}