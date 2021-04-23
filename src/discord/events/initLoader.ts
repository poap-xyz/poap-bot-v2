import {inject, injectable} from "inversify";
import {CommandLoader} from "../loaders/commandLoader";
import {TYPES} from "../../config/types";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {MaintenanceDBService} from "../../interfaces/services/maintenance/maintenanceDBService";
import {MintChannelService} from "../../interfaces/services/discord/mintChannelService";
import {ContractService} from "../../interfaces/services/core/contract/contractService";
import {TokenWorkerService} from "../../interfaces/services/queue/tokenWorkerService";

@injectable()
export class InitLoader {
    private readonly eventScheduleService: EventScheduleService;
    private readonly maintenanceDBService: MaintenanceDBService;
    private readonly mintChannelService: MintChannelService;
    private readonly tokenWorkerService: TokenWorkerService;
    private readonly contractService: ContractService;

    constructor(@inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService,
                @inject(TYPES.MaintenanceDBService) maintenanceDBService: MaintenanceDBService,
                @inject(TYPES.TokenWorkerService) tokenWorkerService: TokenWorkerService,
                @inject(TYPES.MintChannelService) mintChannelService: MintChannelService,
                @inject(TYPES.ContractService) contractService: ContractService) {
        this.eventScheduleService = eventScheduleService;
        this.maintenanceDBService = maintenanceDBService;
        this.tokenWorkerService = tokenWorkerService;
        this.mintChannelService = mintChannelService;
        this.contractService = contractService;
    }

    async init(){
        await this.initDB();
        await this.eventScheduleService.schedulePendingEvents();
        await this.mintChannelService.initSubscribers();
        await this.contractService.initListener();
        this.tokenWorkerService.createWorker(); //TODO Think if this should be in another process or docker image
    }

    private async initDB(){
        if(!(await this.maintenanceDBService.isDBReady()))
            throw new Error("DB Not ready!");

        try {
            if (!(await this.maintenanceDBService.checkTablesCreated()))
                await this.maintenanceDBService.createTables();
        }catch (e){
            throw new Error(`DB populate error: ${e}`);
        }
    }
}