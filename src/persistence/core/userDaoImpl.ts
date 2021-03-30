import {inject, injectable} from "inversify";
import {ExtendedProtocol, TYPES} from "../../config/types";
import {User} from "../../models/user";
import {UserDao} from "../../interfaces/persistence/core/userDao";

@injectable()
export class UserDaoImpl implements UserDao{
    private db: ExtendedProtocol;

    constructor(@inject(TYPES.DB) db) {
        this.db = db;
    }

    public async getBannedUsersById(user_id: User['id']): Promise<boolean>{
        const res = await this.db.one(
            "SELECT COUNT(*) FROM users WHERE user_id LIKE $1::text",
            [user_id], (a: { count: string }) => +a.count);

        return res != 0;
    }
}
