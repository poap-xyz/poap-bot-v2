import {IDatabase} from "pg-promise";

export const TYPES = {
    /* Logger Types */
    Logger: Symbol("Logger"),
    /* DB Types */
    PgPromise: Symbol("PgPromise"),
    DB: Symbol("DB"),
    /* Core Types */
    Bot: Symbol("Bot"),
    Client: Symbol("Client"),
    Token: Symbol("Token"),
    /* Services Types */
    MessageResponder: Symbol("MessageResponder"),
    /* Commands Types */
    PingFinder: Symbol("PingFinder"),
};
/* DB Protocol Type export */
export type ExtendedProtocol = IDatabase<any>;
//export type ExtendedProtocol = IDatabase<IExtensions> & IExtensions;
