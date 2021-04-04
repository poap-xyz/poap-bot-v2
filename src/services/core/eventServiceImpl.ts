import {Event} from "../../models/event";
import {inject, injectable} from "inversify";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import {EventDao} from "../../interfaces/persistence/core/eventDao";
import {CodeService} from "../../interfaces/services/core/codeService";
import {logger} from "../../logger";
import {CodeInput} from "../../models/input/codeInput";
import {EventInput} from "../../models/input/eventInput";

@injectable()
export class EventServiceImpl implements EventService{
    private eventDao: EventDao;
    private codeService: CodeService;

    constructor(@inject(TYPES.EventDao) eventDao: EventDao, @inject(TYPES.CodeService) codeService: CodeService) {
        this.eventDao = eventDao;
        this.codeService = codeService;
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

    public async saveEvent(event: EventInput, username: string){
        const savedEvent: Event = await this.eventDao.saveEvent(event);
        if(event.codes){
            const codes = EventServiceImpl.createCodeInputByEvent(savedEvent, event.codes);
            savedEvent.codes = await this.codeService.addCodes(codes);
        }

        return savedEvent;
    }

    private static createCodeInputByEvent(savedEvent: Event, codeInputs: CodeInput[]): CodeInput[]{
        const codeInputsFinal: CodeInput[] = [];
        for(let i = 0; i < codeInputs.length; i++){
            codeInputsFinal.push({...codeInputs[i], event_id: savedEvent.id})
        }
        return codeInputsFinal;
    }

    isPassAvailable(messageContent: string): Promise<boolean> {
        return this.eventDao.isPassAvailable(messageContent);
    }
}