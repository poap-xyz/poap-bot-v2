import {CodeService} from "../../interfaces/services/codeService";
import {inject} from "inversify";
import {TYPES} from "../../config/types";
import {CodeDao} from "../../interfaces/persistence/codeDao";
import {Code} from "../../models/code";

export class CodeServiceImpl implements CodeService{
    private codeDao: CodeDao;

    constructor(@inject(TYPES.CodeDao) codeDao: CodeDao) {
        this.codeDao = codeDao;
    }

    public async addCode(uuid: Code["id"], code: Code["code"]): Promise<Code>{
        return this.codeDao.addCode(uuid, code);
    }

    public async countClaimedCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countClaimedCodes(event_id);
    }

    public async countTotalCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countTotalCodes(event_id);
    }

}