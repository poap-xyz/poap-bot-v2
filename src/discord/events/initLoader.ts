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
    private readonly mintService: ContractService;

    constructor(@inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService,
                @inject(TYPES.MaintenanceDBService) maintenanceDBService: MaintenanceDBService,
                @inject(TYPES.TokenWorkerService) tokenWorkerService: TokenWorkerService,
                @inject(TYPES.MintChannelService) mintChannelService: MintChannelService,
                @inject(TYPES.MintService) mintService: ContractService) {
        this.eventScheduleService = eventScheduleService;
        this.maintenanceDBService = maintenanceDBService;
        this.tokenWorkerService = tokenWorkerService;
        this.mintChannelService = mintChannelService;
        this.mintService = mintService;
    }

    async init(){
        await this.initDB();
        await this.eventScheduleService.schedulePendingEvents();
        await this.mintChannelService.initSubscribers();
        await this.mintService.initListener();
        this.tokenWorkerService.createWorker();
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