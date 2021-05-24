import {BotEvent} from "../../models/core/botEvent";
import {inject, injectable} from "inversify";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import {EventDao} from "../../interfaces/persistence/core/eventDao";
import {CodeService} from "../../interfaces/services/core/codeService";
import {CodeInput} from "../../models/input/codeInput";
import {BotEventInput} from "../../models/input/botEventInput";

@injectable()
export class EventServiceImpl implements EventService{
    private readonly eventDao: EventDao;
    private readonly codeService: CodeService;

    constructor(@inject(TYPES.EventDao) eventDao: EventDao,
                @inject(TYPES.CodeService) codeService: CodeService) {
        this.eventDao = eventDao;
        this.codeService = codeService;
    }

    public async getActiveEventByPass(eventPass: string): Promise<BotEvent> {
        return await this.eventDao.getActiveEventByPass(eventPass);
    }

    public async getRealtimeActiveEvents(): Promise<BotEvent[]>{
        return await this.eventDao.getRealtimeActiveEvents();
    }

    public async getFutureActiveEvents(): Promise<BotEvent[]>{
        return await this.eventDao.getFutureActiveEvents();
    }

    public async getAllEvents(): Promise<BotEvent[]>{
        return await this.eventDao.getAllEvents();
    }

    public async getEventById(eventId: BotEvent['id']): Promise<BotEvent>{
        return await this.eventDao.getEventById(eventId);
    }

    public async getGuildEvents(server: BotEvent['server']): Promise<BotEvent[]>{
        return await this.eventDao.getGuildEvents(server);
    }

    public async getGuildActiveEvents(server: BotEvent['server']): Promise<BotEvent[]>{
        return await this.eventDao.getGuildActiveEvents(server);
    }

    async saveEvent(event: BotEventInput): Promise<BotEvent>{
        const savedEvent: BotEvent = await this.eventDao.saveEvent(event);
        if(event.codes){
            const codes = EventServiceImpl.createCodeInputByEvent(savedEvent, event.codes);
            savedEvent.codes = await this.codeService.addCodes(codes);
        }

        return savedEvent;
    }

    async updateEvent(event: BotEvent): Promise<BotEvent> {
        const savedEvent: BotEvent = await this.eventDao.updateEvent(event);
        if(event.codes){
            const codes = EventServiceImpl.createCodeInputByEvent(savedEvent, event.codes);
            savedEvent.codes = await this.codeService.addCodes(codes);
        }

        return savedEvent;
    }

    private static createCodeInputByEvent(savedEvent: BotEvent, codeInputs: CodeInput[]): CodeInput[]{
        const codeInputsFinal: CodeInput[] = [];
        for(let i = 0; i < codeInputs.length; i++){
            codeInputsFinal.push({...codeInputs[i], event_id: savedEvent.id})
        }
        return codeInputsFinal;
    }

    isPassAvailable(messageContent: string): Promise<boolean> {
        const eventPass = messageContent.trim().toLowerCase();
        return this.eventDao.isPassAvailable(eventPass);
    }

    public async getEventByPass(messageContent: string): Promise<BotEvent | null>{
        const eventPass = messageContent.trim().toLowerCase();
        return await this.eventDao.getEventByPass(eventPass);
    }

    getUserActiveEvents(user: BotEvent["created_by"]): Promise<BotEvent[]> {
        return this.eventDao.getUserActiveEvents(user);
    }

    getUserEvents(user: BotEvent["created_by"]): Promise<BotEvent[]> {
        return this.eventDao.getUserEvents(user);
    }
}
