import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import {MessageHandler} from "../discord/events/messageHandler";
import {loggerConfig} from "./logger.config";
import {DBConfig} from "./db.config";
import {CommandLoader} from "../discord/loaders/commandLoader";
import * as pgPromise from 'pg-promise';
import {EventServiceImpl} from "../services/schedule/eventServiceImpl";
import {EventService} from "../interfaces/services/core/eventService";
import {EventDaoImpl} from "../persistence/core/eventDaoImpl";
import {EventDao} from "../interfaces/persistence/core/eventDao";
import {CodeDaoImpl} from "../persistence/core/codeDaoImpl";
import {UserDaoImpl} from "../persistence/core/userDaoImpl";
import {CodeDao} from "../interfaces/persistence/core/codeDao";
import {UserDao} from "../interfaces/persistence/core/userDao";
import {CodeService} from "../interfaces/services/core/codeService";
import {UserService} from "../interfaces/services/core/userService";
import {CodeServiceImpl} from "../services/core/codeServiceImpl";
import {UserServiceImpl} from "../services/core/userServiceImpl";
import {ScheduleServiceImpl} from "../services/schedule/scheduleServiceImpl";
import {ScheduleService} from "../interfaces/services/schedule/scheduleService";
import {GuildService} from "../interfaces/services/discord/guildService";
import {GuildServiceImpl} from "../services/discord/guildServiceImpl";
import {InitLoader} from "../discord/events/initLoader";
import {EventScheduleService} from "../interfaces/services/schedule/eventScheduleService";
import {EventScheduleServiceImpl} from "../services/core/eventScheduleServiceImpl";
import {MaintenanceDBImpl} from "../persistence/maintenance/maintenanceDBImpl";
import {MaintenanceDBService} from "../interfaces/services/maintenance/maintenanceDBService";
import {MaintenanceDBServiceImpl} from "../services/maintenance/maintenanceDBServiceImpl";
import {MaintenanceDB} from "../interfaces/persistence/maintenance/maintenanceDB";

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
container.bind<MaintenanceDB>(TYPES.MaintenanceDB).to(MaintenanceDBImpl).inSingletonScope();

/* Services binds */
container.bind<EventService>(TYPES.EventService).to(EventServiceImpl).inSingletonScope();
container.bind<CodeService>(TYPES.CodeService).to(CodeServiceImpl).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserServiceImpl).inSingletonScope();
container.bind<ScheduleService>(TYPES.ScheduleService).to(ScheduleServiceImpl).inSingletonScope();
container.bind<EventScheduleService>(TYPES.EventScheduleService).to(EventScheduleServiceImpl).inSingletonScope();
container.bind<GuildService>(TYPES.GuildService).to(GuildServiceImpl).inSingletonScope();
container.bind<MaintenanceDBService>(TYPES.MaintenanceDBService).to(MaintenanceDBServiceImpl).inSingletonScope();

container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<InitLoader>(TYPES.InitLoader).to(InitLoader).inSingletonScope();
container.bind<CommandLoader>(TYPES.CommandLoader).to(CommandLoader).inSingletonScope();

export default container;
