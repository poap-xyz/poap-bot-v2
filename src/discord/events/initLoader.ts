import {inject, injectable} from "inversify";
import {CommandLoader} from "../loaders/commandLoader";
import {TYPES} from "../../config/types";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {MaintenanceDBService} from "../../interfaces/services/maintenance/maintenanceDBService";
import {MintChannelService} from "../../interfaces/services/discord/mintChannelService";
import {MintService} from "../../interfaces/services/core/mintService";
import {TokenWorkerService} from "../../interfaces/services/queue/tokenWorkerService";

@injectable()
export class InitLoader {
    private readonly eventScheduleService: EventScheduleService;
    private readonly maintenanceDBService: MaintenanceDBService;
    private readonly mintChannelService: MintChannelService;
    private readonly tokenWorkerService: TokenWorkerService;
    private readonly mintService: MintService;

    constructor(@inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService,
                @inject(TYPES.MaintenanceDBService) maintenanceDBService: MaintenanceDBService,
                @inject(TYPES.TokenWorkerService) tokenWorkerService: TokenWorkerService,
                @inject(TYPES.MintChannelService) mintChannelService: MintChannelService,
                @inject(TYPES.MintService) mintService: MintService) {
        this.eventScheduleService = eventScheduleService;
        this.maintenanceDBService = maintenanceDBService;
        this.tokenWorkerService = tokenWorkerService;
        this.mintChannelService = mintChannelService;
        this.mintService = mintService;
    }

    async init(){
        if(!(await this.maintenanceDBService.isDBReady()))
            throw new Error("DB Not ready!");

        if(!(await this.maintenanceDBService.checkTablesCreated()))
            await this.maintenanceDBService.createTables();

        await this.eventScheduleService.schedulePendingEvents();
        await this.mintChannelService.initSubscribers();
        await this.mintService.cacheLastMintedTokens();
        this.tokenWorkerService.createWorker();
    }
}