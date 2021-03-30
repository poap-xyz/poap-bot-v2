import {inject, injectable} from "inversify";
import {CommandLoader} from "../loaders/commandLoader";
import {TYPES} from "../../config/types";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {MaintenanceDBService} from "../../interfaces/services/maintenance/maintenanceDBService";

@injectable()
export class InitLoader {
    private readonly eventScheduleService: EventScheduleService;
    private readonly maintenanceDBService: MaintenanceDBService;

    constructor(@inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService,
                @inject(TYPES.MaintenanceDBService) maintenanceDBService: MaintenanceDBService) {
        this.eventScheduleService = eventScheduleService;
        this.maintenanceDBService = maintenanceDBService;
    }

    async init(){
        if(!(await this.maintenanceDBService.isDBReady()))
            throw new Error("DB Not ready!");

        if(!(await this.maintenanceDBService.checkTablesCreated()))
            await this.maintenanceDBService.createTables();

        await this.eventScheduleService.schedulePendingEvents();
    }
}