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
        return await this.db.one<boolean>("select count(*) from information_schema.tables where $1::text = table_name or $2::text = table_name or $3::text = table_name or $4::text = table_name;",
            ['events', 'codes', 'users', 'subscribed_channels_token'],(a: { count: string }) => +a.count >= 5);
    }

    async createTables(): Promise<void> {
        await this.db.task(async (t) => {
            await t.none("CREATE SEQUENCE IF NOT EXISTS event_id_seq;");
            await t.none("CREATE TABLE IF NOT EXISTS events ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('event_id_seq'), server numeric NOT NULL, channel numeric NOT NULL," +
                " start_date timestamp NOT NULL, end_date timestamp NOT NULL, response_message TEXT NOT NULL, pass TEXT UNIQUE, created_by numeric NOT NULL, created_date timestamp NOT NULL," +
                " file_url VARCHAR ( 128 ) NOT NULL, is_active BOOLEAN DEFAULT TRUE, is_whitelisted BOOLEAN NULL, whitelist_file_url TEXT NULL);");
            await t.none("ALTER SEQUENCE event_id_seq OWNED BY events.id;");

            await t.none("CREATE SEQUENCE IF NOT EXISTS code_id_seq;");
            await t.none("CREATE TABLE IF NOT EXISTS codes ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('code_id_seq'), code VARCHAR ( 32 ) UNIQUE NOT NULL, event_id integer NOT NULL," +
                " username numeric NULL, is_active BOOLEAN DEFAULT TRUE, claimed_date timestamp NULL, created_date timestamp NOT NULL);");
            await t.none("ALTER SEQUENCE code_id_seq OWNED BY codes.id;");
            await t.none("ALTER TABLE codes DROP CONSTRAINT IF EXISTS event_id_constraint;");
            await t.none("ALTER TABLE codes ADD CONSTRAINT event_id_constraint FOREIGN KEY (event_id) REFERENCES events(id);");

            await t.none("CREATE SEQUENCE IF NOT EXISTS user_id_seq;");
            await t.none("CREATE TABLE IF NOT EXISTS users ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('user_id_seq'), user_id numeric UNIQUE NOT NULL );");
            await t.none("ALTER SEQUENCE user_id_seq OWNED BY users.id;");

            await t.none("CREATE SEQUENCE IF NOT EXISTS whitelist_id_seq;");
            await t.none("CREATE TABLE IF NOT EXISTS whitelist ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('whitelist_id_seq'), user_id numeric NOT NULL, event_id integer NOT NULL, UNIQUE (user_id, event_id) );");
            await t.none("ALTER SEQUENCE whitelist_id_seq OWNED BY whitelist.id;");
            await t.none("ALTER TABLE whitelist DROP CONSTRAINT IF EXISTS event_id_constraint;");
            await t.none("ALTER TABLE whitelist ADD CONSTRAINT event_id_constraint FOREIGN KEY (event_id) REFERENCES events(id);");

            await t.none("CREATE SEQUENCE IF NOT EXISTS subscribed_channels_token_id_seq;");
            await t.none("CREATE TABLE IF NOT EXISTS subscribed_channels_token ( id integer PRIMARY KEY NOT NULL DEFAULT nextval('subscribed_channels_token_id_seq'), server numeric NOT NULL, channel numeric NOT NULL," +
                " mainnet BOOLEAN DEFAULT TRUE, xdai BOOLEAN DEFAULT TRUE, UNIQUE (server, channel));");
            await t.none("ALTER SEQUENCE subscribed_channels_token_id_seq OWNED BY subscribed_channels_token.id;");
        });
    }

    async isDBReady(): Promise<boolean> {
        return await this.db.one<boolean>("select count(*) from pg_database", [],(a: { count: string }) => +a.count > 0);
    }
}