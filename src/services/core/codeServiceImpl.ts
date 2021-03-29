import {CodeService} from "../../interfaces/services/core/codeService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {CodeDao} from "../../interfaces/persistence/core/codeDao";
import {Code} from "../../models/code";
import {CodeInput} from "../../models/input/codeInput";
import {Event} from "../../models/event";
@injectable()
export class CodeServiceImpl implements CodeService{
    private codeDao: CodeDao;

    constructor(@inject(TYPES.CodeDao) codeDao: CodeDao) {
        this.codeDao = codeDao;
    }

    public async addCode(code: CodeInput): Promise<Code>{
        return this.codeDao.addCode(code);
    }
    public async addCodes(codes: CodeInput[]): Promise<Code[]> {
        const savedCodes: Code[] = [];
        if(!Array.isArray(codes))
            return Promise.reject("Argument codes is not an Array of CodeInput");

        for(let i = 0; i < savedCodes.length; i++){
            savedCodes.push(await this.addCode(codes[i]));
        }

        return savedCodes;
    }

    public async countClaimedCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countClaimedCodes(event_id);
    }

    public async checkCodeForEventUsername(event_id: Event['id'], username: string){
        return await this.codeDao.checkCodeForEventUsername(event_id, username);
    }

    public async countTotalCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countTotalCodes(event_id);
    }
}