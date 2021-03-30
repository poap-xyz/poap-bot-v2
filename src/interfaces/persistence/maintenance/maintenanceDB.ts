export interface MaintenanceDB {
    isDBReady(): Promise<boolean>;
    checkTablesCreated(): Promise<boolean>;
    createTables(): Promise<void>;
}