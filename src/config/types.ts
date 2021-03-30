import {IDatabase} from "pg-promise";
import {CommandLoader} from "../discord/loaders/commandLoader";

export const TYPES = {
    /* DB Types */
    DB: Symbol("DB"),

    /* Core Types */
    Bot: Symbol("Bot"),
    Client: Symbol("Client"),
    Token: Symbol("Token"),

    /* Services Types */
    EventService: Symbol("EventService"),
    EventScheduleService: Symbol("EventScheduleService"),
    ScheduleService: Symbol("ScheduleService"),
    CodeService: Symbol("CodeService"),
    UserService: Symbol("UserService"),
    GuildService: Symbol("GuildService"),
    MaintenanceDBService: Symbol("MaintenanceDBService"),

    MessageHandler: Symbol("MessageHandler"),
    InitLoader: Symbol("InitHandler"),
    CommandLoader: Symbol("CommandLoader"),

    /* Persistence Types */
    EventDao: Symbol("EventDao"),
    CodeDao: Symbol("CodeDao"),
    UserDao: Symbol("UserDao"),
    MaintenanceDB: Symbol("MaintenanceDB")

};
/* DB Protocol Type export */
export type ExtendedProtocol = IDatabase<any>;
//export type ExtendedProtocol = IDatabase<IExtensions> & IExtensions;
