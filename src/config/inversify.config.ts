import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import {MessageHandler} from "../services/events/messageHandler";
import {loggerConfig} from "./logger.config";
import {DBConfig} from "./db.config";
import {CommandLoader} from "../services/loaders/commandLoader";
import * as pgPromise from 'pg-promise';
import {EventServiceImpl} from "../services/core/eventServiceImpl";
import {EventService} from "../interfaces/services/core/eventService";
import {EventDaoImpl} from "../persistence/eventDaoImpl";
import {EventDao} from "../interfaces/persistence/eventDao";
import {CodeDaoImpl} from "../persistence/codeDaoImpl";
import {UserDaoImpl} from "../persistence/userDaoImpl";
import {CodeDao} from "../interfaces/persistence/codeDao";
import {UserDao} from "../interfaces/persistence/userDao";
import {CodeService} from "../interfaces/services/core/codeService";
import {UserService} from "../interfaces/services/core/userService";
import {CodeServiceImpl} from "../services/core/codeServiceImpl";
import {UserServiceImpl} from "../services/core/userServiceImpl";
import {ScheduleServiceImpl} from "../services/core/scheduleServiceImpl";
import {ScheduleService} from "../interfaces/services/core/scheduleService";
import {GuildManager} from "../_helpers/utils/guildManager";

let container = new Container();

/* DB Binds */
container.bind<pgPromise.IDatabase<any>>(TYPES.DB).toConstantValue(pgPromise()(DBConfig));

/* Core binds */
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);

/* Persistence binds */
container.bind<EventDao>(TYPES.EventDao).to(EventDaoImpl).inSingletonScope();
container.bind<CodeDao>(TYPES.CodeDao).to(CodeDaoImpl).inSingletonScope();
container.bind<UserDao>(TYPES.UserDao).to(UserDaoImpl).inSingletonScope();

/* Services binds */
container.bind<EventService>(TYPES.EventService).to(EventServiceImpl).inSingletonScope();
container.bind<CodeService>(TYPES.CodeService).to(CodeServiceImpl).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserServiceImpl).inSingletonScope();
container.bind<ScheduleService>(TYPES.ScheduleService).to(ScheduleServiceImpl).inSingletonScope();

container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<CommandLoader>(TYPES.CommandLoader).to(CommandLoader).inSingletonScope();

/* Utils binds */
container.bind<GuildManager>(TYPES.GuildManager).to(GuildManager).inSingletonScope();
export default container;
