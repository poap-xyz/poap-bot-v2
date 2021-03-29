import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {Event} from "../../models/event";
import {EventDao} from "../../interfaces/persistence/core/eventDao";
import {CodeInput} from "../../models/input/codeInput";
import {EventInput} from "../../models/input/eventInput";

@injectable()
export class EventDaoImpl implements EventDao{
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.DB) db){
        this.db = db;
    }

    public async getRealtimeActiveEvents(): Promise<Event[]> {
        const now = new Date();
        return await this.db.any<Event>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp AND is_active = $2",
            [now, true]);
    }

    public async getFutureActiveEvents(): Promise<Event[]> {
        const now = new Date();
        return await this.db.any<Event>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND is_active = $2",
            [now, true]);
    }

    public async getAllEvents(): Promise<Event[]> {
        return await this.db.any<Event>("SELECT * FROM events WHERE is_active = $1", [true,]);
    }

    public async getGuildEvents(server: Event['server']): Promise<Event[]> {
        const now = new Date();
        return await this.db.any<Event>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND server = $2::text AND is_active = $3",
            [now, server, true]);
    }

    public async getGuildActiveEvents(server: Event['server']): Promise<Event[]> {
        const now = new Date();
        return await this.db.any<Event>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp " +
                    "AND server = $2::text AND is_active = $3", [now, server, true]);
    }

    public async getEventFromPass(messageContent: string): Promise<Event | null> {
        const eventPass = messageContent.trim().toLowerCase();
        return await this.db.one<Event>("SELECT * FROM events WHERE server = $1::text AND is_active = $2", [eventPass, true]);
    }

    public async isPassAvailable(messageContent: string): Promise<boolean>{
        const eventPass = messageContent.trim().toLowerCase();
        const events = await this.db.any<Event>("SELECT * FROM events WHERE server = $1::text", [eventPass]);
        return events.length === 0;
    }

    static isMsgTheSame(message: string, eventPass: Event['pass']) {
        let messagePass = message.replace('!', '').replace(/ /g, "");
        return eventPass.toLowerCase().includes(messagePass.toLowerCase());
    }

    public async saveEvent(event: EventInput): Promise<Event>{
        return await this.db.one<Event>(
            "INSERT INTO events " +
            "(server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted) " +
            "VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) " +
            "RETURNING id, server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted;",
            [event.server, event.channel, event.start_date, event.end_date, event.response_message, event.pass,
                    event.file_url, event.created_by, event.created_date, false,]
        );
    }
}
