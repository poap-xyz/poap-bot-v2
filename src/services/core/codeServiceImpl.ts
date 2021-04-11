import {CodeService} from "../../interfaces/services/core/codeService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {CodeDao} from "../../interfaces/persistence/core/codeDao";
import {Code} from "../../models/core/code";
import {CodeInput} from "../../models/input/codeInput";
import {BotEvent} from "../../models/core/event";
import {logger} from "../../logger";
@injectable()
export class CodeServiceImpl implements CodeService{
    private codeDao: CodeDao;

    constructor(@inject(TYPES.CodeDao) codeDao: CodeDao) {
        this.codeDao = codeDao;
    }

    public async addCode(code: CodeInput): Promise<Code>{
        return await this.codeDao.addCode(code);
    }

    public async addCodes(codes: CodeInput[]): Promise<Code[]> {
        const savedCodes: Code[] = [];
        if(!Array.isArray(codes))
            throw new Error("Argument codes is not an Array of CodeInput");

        for(let i = 0; i < codes.length; i++){
            try {
                savedCodes.push(await this.addCode(codes[i]));
            }catch (e){
                logger.error(`[CodeService] Cannot add code ${JSON.stringify(codes[i])}, error: ${e}`);
            }
        }

        return savedCodes;
    }

    public async checkCodeForEventUsername(event_id: BotEvent['id'], username: string){
        return await this.codeDao.checkCodeForEventUsername(event_id, username);
    }

    public async countClaimedCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countClaimedCodes(event_id);
    }

    public async countTotalCodes(event_id: Code["event_id"]): Promise<number> {
        return this.codeDao.countTotalCodes(event_id);
    }
}