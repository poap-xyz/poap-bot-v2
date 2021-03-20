import {Event} from "../../models/event";
import {inject, injectable} from "inversify";
import {EventService} from "../../interfaces/services/eventService";
import {TYPES} from "../../config/types";
import {EventDao} from "../../interfaces/persistence/eventDao";
@injectable()
export class EventServiceImpl implements EventService{
    private eventDao: EventDao;

    constructor(@inject(TYPES.EventDao) eventDao: EventDao) {
        this.eventDao = eventDao;
    }

    public async getRealtimeActiveEvents(): Promise<Event[]>{
        return await this.eventDao.getRealtimeActiveEvents();
    }

    public async getFutureActiveEvents(): Promise<Event[]>{
        return await this.eventDao.getFutureActiveEvents();
    }

    public async getAllEvents(): Promise<Event[]>{
        return await this.eventDao.getAllEvents();
    }

    public async getGuildEvents(server: Event['server']): Promise<Event[]>{
        return await this.eventDao.getGuildEvents(server);
    }

    public async getGuildActiveEvents(server: Event['server']): Promise<Event[]>{
        return await this.eventDao.getGuildActiveEvents(server);
    }

    public async getEventFromPass(messageContent: string): Promise<Event | null>{
        return await this.eventDao.getEventFromPass(messageContent);
    }

    public async checkCodeForEventUsername(event_id: Event['id'], username: string){
        return await this.eventDao.checkCodeForEventUsername(event_id, username);
    }

    public async saveEvent(event: Event, username: string){
        return await this.eventDao.saveEvent(event, username);
    }

    isPassAvailable(messageContent: string): Promise<boolean> {
        return this.eventDao.isPassAvailable(messageContent);
    }
}