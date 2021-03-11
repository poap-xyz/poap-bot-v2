import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../config/types";
import {Event} from "../models/core/event";

@injectable()
export class EventsDao {
    private db: ExtendedProtocol;
    constructor(@inject(TYPES.PgPromise) db){
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
        const events = await this.getRealtimeActiveEvents();

        return events.find((e) =>
            EventsDao.isMsgTheSame(messageContent, e.pass)
        );
    }

    private static isMsgTheSame(message: string, eventPass: Event['pass']) {
        let messagePass = message.replace('!', '').replace(/ /g, "");
        return eventPass.toLowerCase().includes(messagePass.toLowerCase());
    }

    public async checkCodeForEventUsername(event_id: Event['id'], username: string) {
        const now = new Date();
        return await this.db.task(async (t) => {
                // TODO check whitelisted for event_id
                await t.none(
                    "SELECT * FROM codes WHERE event_id = $1 AND username = $2::text",
                    [event_id, username]
                );
                const code = await t.one(
                    "UPDATE codes SET username = $1, claimed_date = $3::timestamp WHERE code in (SELECT code FROM codes WHERE event_id = $2 AND username IS NULL ORDER BY RANDOM() LIMIT 1) RETURNING code",
                    [username, event_id, now]
                );
                console.log(`[DB] checking event: ${event_id}, user: ${username} `);
                return code;
            })
            .then((data) => {
                // console.log(data);
                return data;
            })
            .catch((error) => {
                console.log(`[ERROR] ${error.message} -> ${error.received}`);
                return false;
            });
    }

    public async saveEvent(event: Event, username: string) {
        const now = new Date();

        return await this.db.none(
            "INSERT INTO events (id, server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);",
            [
                event.id,
                event.server,
                event.channel,
                event.start_date,
                event.end_date,
                event.response_message,
                event.pass,
                event.file_url,
                username,
                now,
                false,
            ]
        );
    }
}
