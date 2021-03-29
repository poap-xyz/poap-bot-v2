import {User} from "../../../models/user";

export interface UserDao{
    getBannedUsersById(user_id: User['id']): Promise<boolean>;
}