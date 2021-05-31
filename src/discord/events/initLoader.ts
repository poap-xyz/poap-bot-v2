import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {MaintenanceDBService} from "../../interfaces/services/maintenance/maintenanceDBService";
import {ContractService} from "../../interfaces/services/core/contract/contractService";
import {TokenWorkerService} from "../../interfaces/services/queue/tokenWorkerService";
import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";
import {CommandLoader} from "../loaders/commandLoader";

@injectable()
export class InitLoader {
    private readonly eventScheduleService: EventScheduleService;
    private readonly maintenanceDBService: MaintenanceDBService;
    private readonly subscribedChannelService: SubscribedChannelService;
    private readonly tokenWorkerService: TokenWorkerService;
    private readonly contractService: ContractService;
    private readonly commandLoader: CommandLoader;

    constructor(@inject(TYPES.CommandLoader) commandLoader: CommandLoader,
                @inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService,
                @inject(TYPES.MaintenanceDBService) maintenanceDBService: MaintenanceDBService,
                @inject(TYPES.TokenWorkerService) tokenWorkerService: TokenWorkerService,
                @inject(TYPES.SubscribedChannelService) subscribedChannelService: SubscribedChannelService,
                @inject(TYPES.ContractService) contractService: ContractService) {
        this.commandLoader = commandLoader;
        this.eventScheduleService = eventScheduleService;
        this.maintenanceDBService = maintenanceDBService;
        this.tokenWorkerService = tokenWorkerService;
        this.subscribedChannelService = subscribedChannelService;
        this.contractService = contractService;
    }

    async init(){
        this.commandLoader.init();
        await this.initDB();
        await this.eventScheduleService.schedulePendingEvents();
        await this.subscribedChannelService.initSubscribersService();
        await this.contractService.initListener();
        this.tokenWorkerService.createWorker(); //TODO Think if this should be in another process or docker image
    }

    private async initDB(){
        if(!(await this.maintenanceDBService.isDBReady())){
            throw new Error("DB Not ready!");
        }

        try {
            if (!(await this.maintenanceDBService.checkTablesCreated()))
                await this.maintenanceDBService.createTables();
        }catch (e){
            throw new Error(`DB populate error: ${e}`);
        }
    }
}
