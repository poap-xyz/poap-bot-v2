import {User} from "../../../models/core/user";

export interface UserDao{
    getBannedUsersById(user_id: User['id']): Promise<boolean>;
}