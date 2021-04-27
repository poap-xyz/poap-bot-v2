import {IDatabase} from "pg-promise";
import {CommandLoader} from "../discord/loaders/commandLoader";

export const TYPES = {
    /* DB Types */
    DB: Symbol("DB"),
    Cache: Symbol("Cache"),

    /* Core Types */
    Bot: Symbol("Bot"),
    Client: Symbol("Client"),

    /* Environment Types */
    Token: Symbol("Token"),
    ProviderXDai: Symbol("ProviderXDai"),
    ProviderMainnet: Symbol("ProviderMainnet"),

    /* Persistence Types */
    EventDao: Symbol("EventDao"),
    CodeDao: Symbol("CodeDao"),
    UserDao: Symbol("UserDao"),
    SubscribedChannelDao: Symbol("SubscribedChannelDao"),

    MaintenanceDB: Symbol("MaintenanceDB"),

    /* Cache Types */
    TokenCacheService: Symbol("TokenCacheService"),
    AccountCacheService: Symbol("AccountCacheService"),

    /* Services Types */
    EventService: Symbol("EventService"),
    CodeService: Symbol("CodeService"),
    UserService: Symbol("UserService"),
    ContractService: Symbol("MintService"),
    SubscribedChannelService: Symbol("SubscribedChannelService"),

    /* Schedule Services */
    EventScheduleService: Symbol("EventScheduleService"),
    ScheduleService: Symbol("ScheduleService"),

    /* Discord Services */
    GuildService: Symbol("GuildService"),
    ChannelService: Symbol("ChannelService"),

    /* DB Maintenance Service */
    MaintenanceDBService: Symbol("MaintenanceDBService"),

    /* PubSub Services */
    PublisherService: Symbol("PublisherService"),
    SubscriberService: Symbol("SubscriberService"),

    /* Queue Services */
    TokenQueueService: Symbol("TokenQueueService"),
    TokenWorkerService: Symbol("TokenWorkerService"),

    MessageHandler: Symbol("MessageHandler"),
    InitLoader: Symbol("InitHandler"),
    CommandLoader: Symbol("CommandLoader")
};
/* DB Protocol Type export */
export type ExtendedProtocol = IDatabase<any>;
//export type ExtendedProtocol = IDatabase<IExtensions> & IExtensions;
