export interface MaintenanceDBService {
    isDBReady(): Promise<boolean>;
    checkTablesCreated(): Promise<boolean>;
    createTables(): Promise<void>;
}