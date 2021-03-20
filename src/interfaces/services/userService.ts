import {User} from "../../models/user";

export interface UserService{
    getBannedUsersById(user_id: User['id']): Promise<boolean>;
}