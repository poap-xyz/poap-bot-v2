import {MaintenanceDBService} from "../../interfaces/services/maintenance/maintenanceDBService";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {MaintenanceDB} from "../../interfaces/persistence/maintenance/maintenanceDB";

@injectable()
export class MaintenanceDBServiceImpl implements MaintenanceDBService{
    private maintenanceDB: MaintenanceDB;

    constructor(@inject(TYPES.MaintenanceDB) maintenanceDB: MaintenanceDB) {
        this.maintenanceDB = maintenanceDB;
    }

    async checkTablesCreated(): Promise<boolean> {
        return await this.maintenanceDB.checkTablesCreated();
    }

    async createTables(): Promise<void> {
        await this.maintenanceDB.createTables();
    }

    async isDBReady(): Promise<boolean> {
        return await this.maintenanceDB.isDBReady();
    }

}