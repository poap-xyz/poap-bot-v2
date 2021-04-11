import {UserService} from "../../interfaces/services/core/userService";
import {EventDao} from "../../interfaces/persistence/core/eventDao";
import {inject} from "inversify";
import {TYPES} from "../../config/types";
import {UserDao} from "../../interfaces/persistence/core/userDao";
import {User} from "../../models/core/user";

export class UserServiceImpl implements UserService{
    private userDao: UserDao;

    constructor(@inject(TYPES.UserDao) userDao: UserDao) {
        this.userDao = userDao;
    }

    public async getBannedUsersById(user_id: User["id"]): Promise<boolean> {
        return await this.userDao.getBannedUsersById(user_id);
    };

}