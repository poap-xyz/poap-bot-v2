import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../config/types";
import {User} from "../models/core/user";

@injectable()
export class EventsDao {
    private db: ExtendedProtocol;

    constructor(@inject(TYPES.PgPromise) db) {
        this.db = db;
    }

    public async getBannedUsersById(user_id: User['id']): Promise<boolean>{
        const res = await this.db.one(
            "SELECT COUNT(*) FROM banned WHERE user_id LIKE $1::text",
            [user_id], (a: { count: string }) => +a.count);

        return res != 0;
    }
}
