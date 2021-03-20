import {IDatabase} from "pg-promise";
import {CommandLoader} from "../services/loaders/commandLoader";

export const TYPES = {
    /* DB Types */
    PgPromise: Symbol("PgPromise"),
    DB: Symbol("DB"),

    /* Core Types */
    Bot: Symbol("Bot"),
    Client: Symbol("Client"),
    Token: Symbol("Token"),

    /* Services Types */
    EventService: Symbol("EventService"),
    CodeService: Symbol("CodeService"),
    UserService: Symbol("UserService"),
    MessageHandler: Symbol("MessageHandler"),
    CommandLoader: Symbol("CommandLoader"),

    /* Persistence Types */
    EventDao: Symbol("EventDao"),
    CodeDao: Symbol("CodeDao"),
    UserDao: Symbol("UserDao"),
};
/* DB Protocol Type export */
export type ExtendedProtocol = IDatabase<any>;
//export type ExtendedProtocol = IDatabase<IExtensions> & IExtensions;
