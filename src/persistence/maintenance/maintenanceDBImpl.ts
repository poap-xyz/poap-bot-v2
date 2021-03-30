import {MaintenanceDB} from "../../interfaces/persistence/maintenance/maintenanceDB";
import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../../config/types";

@injectable()
export class MaintenanceDBImpl implements MaintenanceDB {
    private db: ExtendedProtocol;

    constructor(@inject(TYPES.DB) db) {
        this.db = db;
    }

    async checkTablesCreated(): Promise<boolean> {
        return await this.db.one<boolean>("select count(*) from information_schema.tables where $1::text = table_name or $2::text = table_name or $3::text = table_name;",
            ['events', 'codes', 'users'],(a: { count: string }) => +a.count >= 3);
    }

    async createTables(): Promise<void> {
        await this.db.task(async (t) => {
            // TODO check whitelisted for event_id
            await t.none("CREATE SEQUENCE event_id_seq;");
            await t.none("CREATE TABLE events ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('event_id_seq'), server VARCHAR ( 50 ) NOT NULL, channel TEXT NOT NULL, start_date timestamp NOT NULL, end_date timestamp NOT NULL, response_message TEXT NOT NULL, pass TEXT UNIQUE, created_by TEXT NOT NULL, created_date timestamp NOT NULL, file_url TEXT NOT NULL, is_active BOOLEAN DEFAULT TRUE, is_whitelisted BOOLEAN NULL, whitelist_file_url TEXT NULL);");
            await t.none("ALTER SEQUENCE event_id_seq OWNED BY events.id;");
            await t.none("CREATE TABLE codes ( ID SERIAL PRIMARY KEY, code VARCHAR ( 50 ) UNIQUE NOT NULL, event_id integer NOT NULL, username TEXT NULL, is_active BOOLEAN DEFAULT TRUE, claimed_date timestamp NULL, created_date timestamp NOT NULL);");
            await t.none("ALTER TABLE codes ADD CONSTRAINT event_id_constraint FOREIGN KEY (event_id) REFERENCES events(id);")
            await t.none("CREATE TABLE users ( ID SERIAL PRIMARY KEY, user_id TEXT );");
        });
    }

    async isDBReady(): Promise<boolean> {
        return await this.db.one<boolean>("select count(*) from pg_database", [],(a: { count: string }) => +a.count > 0);
    }
}