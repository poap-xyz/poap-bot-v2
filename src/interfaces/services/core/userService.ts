import {User} from "../../../models/core/user";

export interface UserService{
    getBannedUsersById(user_id: User['id']): Promise<boolean>;
}