import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {BotEvent} from "../../models/core/botEvent";
import {EventDao} from "../../interfaces/persistence/core/eventDao";
import {BotEventInput} from "../../models/input/botEventInput";

@injectable()
export class EventDaoImpl implements EventDao{
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.DB) db){
        this.db = db;
    }

    public async getRealtimeActiveEvents(): Promise<BotEvent[]> {
        const now = new Date();
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp AND is_active = $2::boolean",
            [now, true]);
    }

    public async getFutureActiveEvents(): Promise<BotEvent[]> {
        const now = new Date();
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND is_active = $2::boolean",
            [now, true]);
    }

    public async getAllEvents(): Promise<BotEvent[]> {
        return await this.db.any<BotEvent>("SELECT * FROM events WHERE is_active = $1::boolean", [true,]);
    }

    public async getUserEvents(user: BotEvent['created_by']): Promise<BotEvent[]> {
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE created_by = $1::numeric AND is_active = $2::boolean",
            [user, true]);
    }

    public async getUserActiveEvents(user: BotEvent['created_by']): Promise<BotEvent[]> {
        const now = new Date();
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp " +
            "AND created_by = $2::numeric AND is_active = $3::boolean", [now, user, true]);
    }


    public async getGuildEvents(server: BotEvent['server']): Promise<BotEvent[]> {
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE server = $1::numeric AND is_active = $2::boolean",
            [server, true]);
    }

    public async getGuildActiveEvents(server: BotEvent['server']): Promise<BotEvent[]> {
        const now = new Date();
        return await this.db.any<BotEvent>(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp " +
                  "AND server = $2::numeric AND is_active = $3::boolean", [now, server, true]);
    }

    public async getEventById(eventId: BotEvent["id"]): Promise<BotEvent> {
        return await this.db.oneOrNone<BotEvent>("SELECT * FROM events WHERE id = $1;", [eventId]);
    }

    public async getEventByPass(eventPass: string): Promise<BotEvent | null> {
        return await this.db.oneOrNone<BotEvent>("SELECT * FROM events WHERE pass = $1::text AND is_active = $2::boolean", [eventPass, true]);
    }

    public async isPassAvailable(eventPass: string): Promise<boolean>{
        const eventsWithPass = await this.db.one<number>("SELECT count(*) FROM events WHERE pass = $1::text", [eventPass], (a: { count: string }) => +a.count);
        return eventsWithPass === 0;
    }

    public async saveEvent(event: BotEventInput): Promise<BotEvent>{
        return await this.db.one<BotEvent>(
            "INSERT INTO events " +
            "(server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted) " +
            "VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) " +
            "RETURNING id, server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted;",
            [event.server, event.channel, event.start_date, event.end_date, event.response_message, event.pass,
                    event.file_url, event.created_by, event.created_date, false,]
        );
    }

    public async updateEvent(event: BotEvent): Promise<BotEvent>{
        return await this.db.one<BotEvent>(
            "UPDATE events " +
            " SET server = $1::numeric, channel = $2::numeric, start_date = $3, end_date = $4, response_message = $5, pass = $6, file_url = $7, created_by = $8, created_date = $9, is_whitelisted = $10 " +
            " WHERE id = $11 RETURNING id, server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted;",
            [event.server, event.channel, event.start_date, event.end_date, event.response_message, event.pass,
                event.file_url, event.created_by, event.created_date, false, event.id]
        );
    }
}
