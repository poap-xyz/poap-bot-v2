import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../config/types";
import {Code} from "../models/code";
import {CodeDao} from "../interfaces/persistence/codeDao";

@injectable()
export class CodeDaoImpl implements CodeDao{
    private db: ExtendedProtocol;

    constructor(@inject(TYPES.PgPromise) db) {
        this.db = db;
    }

    public async addCode(uuid: Code['id'], code: Code['code']): Promise<Code> {
        const now = new Date();
        return await this.db.none(
            "INSERT INTO codes (code, event_id, created_date ) VALUES ( $1, $2, $3 );",
            [code, uuid, now]
        );
    }

    public async countTotalCodes(event_id: Code['event_id']): Promise<number> {
        return await this.db.one<number>("SELECT count(*) FROM codes WHERE event_id = $1",
            [event_id],(a: { count: string }) => +a.count);
    }

    public async countClaimedCodes(event_id: Code['event_id']): Promise<number> {
        return await this.db.one<number>(
            "SELECT count(*) FROM codes WHERE event_id = $1 AND username IS NOT NULL",
            [event_id], (a: { count: string }) => +a.count);
    }
}
