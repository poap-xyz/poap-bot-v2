export default class DBLegacyQueries{
    static async getRealtimeActiveEvents(db) {
        const now = new Date();

        const res = await db.query(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp AND is_active = $2",
            [now, true]
        );
        return res;
    }

    static async getFutureActiveEvents(db) {
        const now = new Date();

        const res = await db.query(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND is_active = $2",
            [now, true]
        );
        return res;
    }

    static async getAllEvents(db) {
        const res = await db.query("SELECT * FROM events WHERE is_active = $1", [
            true,
        ]);
        return res;
    }

    static async getGuildEvents(db, server) {
        const now = new Date();
        const res = await db.any(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND server = $2::text AND is_active = $3",
            [now, server, true]
        );

        return res;
    }

    static async getGuildActiveEvents(db, server) {
        const now = new Date();
        const res = await db.any(
            "SELECT * FROM events WHERE end_date >= $1::timestamp AND start_date <= $1::timestamp AND server = $2::text AND is_active = $3",
            [now, server, true]
        );

        return res;
    }

    static async getBannedUsersById(db, user_id) {
        console.log("checking, ", user_id);
        const res = await db.any(
            "SELECT COUNT(*) FROM banned WHERE user_id LIKE $1::text",
            user_id
        );
        console.log(user_id, res[0].count);

        return res[0].count > 0;
    }

    static async countTotalCodes(db, event_id) {
        const res = await db.one("SELECT count(*) FROM codes WHERE event_id = $1", [
            event_id,
        ]);

        // console.log("countTotalCodes", res);
        return res;
    }

    static async countClaimedCodes(db, event_id) {
        const res = await db.one(
            "SELECT count(*) FROM codes WHERE event_id = $1 AND username IS NOT NULL",
            [event_id]
        );

        // console.log("countClaimedCodes", res);
        return res;
    }

    static async getEventFromPass(db, messageContent) {
        const events = await this.getAllEvents(db);
        // check for similar strings on active events pass

        const eventSelected = events.find((e) =>
            this.isMsgTheSame(messageContent, e.pass)
        );

        console.log(
            `[DB] ${eventSelected && eventSelected.length} for pass: ${messageContent}`
        );

        return eventSelected;
    }

    static async getActiveEventFromPass(db, messageContent) {
        const events = await this.getRealtimeActiveEvents(db);
        // check for similar strings on active events pass

        const eventSelected = events.find((e) =>
            this.isMsgTheSame(messageContent, e.pass)
        );

        console.log(
            `[DB] ${eventSelected && eventSelected.length} for pass: ${messageContent}`
        );

        return eventSelected;
    }

    static async checkCodeForEventUsername(db, event_id, username) {
        const now = new Date();
        const res = await db
            .task( async (t) => {

                const event = await t.one(
                    "SELECT is_whitelisted FROM events where id = $1",
                    [event_id]
                );

                console.log(`[DB] checking if ${event_id} is_whitelisted: ${event.is_whitelisted}`);

                if (event.is_whitelisted) {
                    const user_whitelisted = await t.one(
                        "SELECT * FROM whitelist WHERE user_id = $1 AND event_id = $2",
                        [username, event_id]
                    );
                }

                let code = await t.oneOrNone(
                    "SELECT * FROM codes WHERE event_id = $1 AND username = $2::text",
                    [event_id, username], (a: {code: string}) => a? a.code : null
                );
                if(code)
                    return code;

                code = await t.one(
                    "UPDATE codes SET username = $1, claimed_date = $3::timestamp WHERE code in (SELECT code FROM codes WHERE event_id = $2 AND username IS NULL ORDER BY RANDOM() LIMIT 1) RETURNING code",
                    [username, event_id, now], (a: {code: string}) => a.code
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

        return res;
    }

    static async saveEvent(db, event, username) {
        const now = new Date();
        console.log(event);

        const res = await db.none(
            "INSERT INTO events (id, server, channel, start_date, end_date, response_message, pass, file_url, created_by, created_date, is_whitelisted ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);",
            [
                event.uuid,
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
        console.log(res);

        return res;
    }

    static async addCode(db, uuid, code) {
        const now = new Date();
        const res = await db.none(
            "INSERT INTO codes (code, event_id, created_date ) VALUES ( $1, $2, $3 );",
            [code, uuid, now]
        );

        return res;
    }

    static async isPassAvailable(db, pass) {
        let res = true;
        const events = await this.getAllEvents(db);

        const eventSelected = events.find((e) =>
            this.isMsgTheSame(pass, e.pass)
        );
        console.log(
            `[DB] exist event: ${eventSelected && eventSelected.id} for pass: ${pass}`
        );
        if (eventSelected) {
            res = false;
        }

        return res;
    }

    private static isMsgTheSame(message, eventPass) {
        let messagePass = message.replace('!', '').replace(/ /g, "")
        return eventPass.localeCompare(messagePass, undefined, { sensitivity: 'base' }) === 0;
    }
}

