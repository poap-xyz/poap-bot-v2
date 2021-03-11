import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import {MessageHandler} from "../services/events/message-handler";
import {PingFinder} from "../commands/ping-finder";
import * as pino from "pino";
import * as pgPromise from 'pg-promise';

import {loggerConfig} from "./logger.config";
import {DBConfig} from "./db.config";
import {BotConfig} from "./bot.config";

let container = new Container();
/* Logger Bind */
container.bind<pino.Logger>(TYPES.Logger).toConstantValue(pino(loggerConfig));

/* DB Binds */
container.bind<pgPromise.IMain>(TYPES.PgPromise).toConstantValue(pgPromise());
container.bind<pgPromise.IDatabase<any>>(TYPES.DB).toConstantValue(pgPromise()(DBConfig));

/* Core binds */
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);

/* Services binds */
container.bind<MessageHandler>(TYPES.MessageResponder).to(MessageHandler).inSingletonScope();

/* Commands binds */
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();

export default container;
