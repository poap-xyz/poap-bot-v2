import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {Code} from "../../models/core/code";
import {CodeDao} from "../../interfaces/persistence/core/codeDao";
import {CodeInput} from "../../models/input/codeInput";
import {BotEvent} from "../../models/core/botEvent";
import {logger} from "../../logger";

@injectable()
export class CodeDaoImpl implements CodeDao{
    private db: ExtendedProtocol;

    constructor(@inject(TYPES.DB) db) {
        this.db = db;
    }

    public async addCode(code: CodeInput): Promise<Code> {
        const now = code.created_date? code.created_date : new Date();
        return await this.db.one<Code>(
            "INSERT INTO codes (code, event_id, created_date ) VALUES ( $1, $2, $3 ) " +
            " RETURNING code, event_id, created_date;",
            [code.code, code.event_id, now]
        );
    }

    public async checkCodeForEventUsername(event_id: BotEvent['id'], username: string): Promise<string> {
        try{
            return await this.checkCodeForEventUsernameTask(event_id, username);
        }catch (e){
            logger.error(`[CodeDao] Error in checkCodeForEventTask, error: ${e}`);
            return undefined;
        }
    }

    private async checkCodeForEventUsernameTask(event_id: BotEvent['id'], username: string): Promise<string>{
        const now = new Date();
        logger.debug(`[CodeDao] checking event: ${event_id}, user: ${username} `);
        return await this.db.task(async (t) => {
            let code = await t.oneOrNone(
                "SELECT code FROM codes WHERE event_id = $1 AND username = $2::text",
                [event_id, username], (a: {code: string}) => a.code);
            if(code)
                return code;

            // TODO check whitelisted for event_id
            code = await t.one(
                "UPDATE codes SET username = $1, claimed_date = $3::timestamp WHERE code in (SELECT code FROM codes WHERE event_id = $2 AND username IS NULL ORDER BY RANDOM() LIMIT 1) RETURNING code",
                [username, event_id, now], (a: {code: string}) => a.code);
            return code;
        })
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
