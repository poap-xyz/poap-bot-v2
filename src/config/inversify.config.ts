import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import {MessageHandler} from "../services/events/messageHandler";
import {PingFinder} from "../commands/ping-finder";
import {loggerConfig} from "./logger.config";
import {DBConfig} from "./db.config";
import {CommandLoader} from "../services/loaders/commandLoader";
import * as pgPromise from 'pg-promise';

let container = new Container();

/* DB Binds */
container.bind<pgPromise.IMain>(TYPES.PgPromise).toConstantValue(pgPromise());
container.bind<pgPromise.IDatabase<any>>(TYPES.DB).toConstantValue(pgPromise()(DBConfig));

/* Core binds */
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);

/* Services binds */
container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<CommandLoader>(TYPES.CommandLoader).to(CommandLoader).inSingletonScope();

/* Commands binds */
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();

export default container;
