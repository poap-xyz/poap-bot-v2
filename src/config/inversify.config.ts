import "reflect-metadata";
import {DBConfig} from "./db.config";
import pgPromise from 'pg-promise';
import {RedisConfig} from "./redis.config";
import IORedis from "ioredis";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import {MessageHandler} from "../discord/events/messageHandler";
import {CommandLoader} from "../discord/loaders/commandLoader";
import {EventServiceImpl} from "../services/core/eventServiceImpl";
import {EventService} from "../interfaces/services/core/eventService";
import {EventDaoImpl} from "../persistence/core/eventDaoImpl";
import {EventDao} from "../interfaces/persistence/core/eventDao";
import {SubscribedChannelDao} from "../interfaces/persistence/core/subscribedChannelDao";
import {CodeDaoImpl} from "../persistence/core/codeDaoImpl";
import {UserDaoImpl} from "../persistence/core/userDaoImpl";
import {CodeDao} from "../interfaces/persistence/core/codeDao";
import {UserDao} from "../interfaces/persistence/core/userDao";
import {CodeService} from "../interfaces/services/core/codeService";
import {UserService} from "../interfaces/services/core/userService";
import {CodeServiceImpl} from "../services/core/codeServiceImpl";
import {UserServiceImpl} from "../services/core/userServiceImpl";
import {SubscribedChannelService} from "../interfaces/services/core/subscribedChannelService";
import {ScheduleServiceImpl} from "../services/schedule/scheduleServiceImpl";
import {ScheduleService} from "../interfaces/services/schedule/scheduleService";
import {GuildService} from "../interfaces/services/discord/guildService";
import {GuildServiceImpl} from "../services/discord/guildServiceImpl";
import {InitLoader} from "../discord/events/initLoader";
import {EventScheduleService} from "../interfaces/services/schedule/eventScheduleService";
import {EventScheduleServiceImpl} from "../services/schedule/eventScheduleServiceImpl";
import {MaintenanceDBImpl} from "../persistence/maintenance/maintenanceDBImpl";
import {MaintenanceDBService} from "../interfaces/services/maintenance/maintenanceDBService";
import {MaintenanceDBServiceImpl} from "../services/maintenance/maintenanceDBServiceImpl";
import {MaintenanceDB} from "../interfaces/persistence/maintenance/maintenanceDB";
import {ChannelService} from "../interfaces/services/discord/channelService";
import {ChannelServiceImpl} from "../services/discord/channelServiceImpl";
import {Redis} from "ioredis";
import {ContractService} from "../interfaces/services/core/contract/contractService";
import {SubscriberServiceImpl} from "../services/pubsub/subscriberServiceImpl";
import {PublisherService} from "../interfaces/services/pubsub/publisherService";
import {SubscriberService} from "../interfaces/services/pubsub/subscriberService";
import {PublisherServiceImpl} from "../services/pubsub/publisherServiceImpl";
import {TokenQueueServiceImpl} from "../services/queue/tokenQueueServiceImpl";
import {TokenQueueService} from "../interfaces/services/queue/tokenQueueService";
import {TokenWorkerServiceImpl} from "../services/queue/tokenWorkerServiceImpl";
import {TokenWorkerService} from "../interfaces/services/queue/tokenWorkerService";
import {AccountCacheService} from "../interfaces/services/cache/accountCacheService";
import {AccountCacheServiceImpl} from "../services/cache/accountCacheServiceImpl";
import {TokenCacheService} from "../interfaces/services/cache/tokenCacheService";
import {TokenCacheServiceImpl} from "../services/cache/tokenCacheServiceImpl";
import {SubscribedChannelServiceImpl} from "../services/core/subscribedChannelServiceImpl";
import {ContractServiceImpl} from "../services/core/contract/contractServiceImpl";
import {SubscribedChannelDaoImpl} from "../persistence/core/subscribedChannelDaoImpl";


let container = new Container();

/* DB Binds */
try{
container.bind<pgPromise.IDatabase<any>>(TYPES.DB).toConstantValue(pgPromise()(DBConfig));
container.bind<Redis>(TYPES.Cache).toConstantValue(new IORedis(RedisConfig));
}catch (e){
    process.exit(1);
}

/* Core binds */
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());

/* Environment binds */
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN);
container.bind<string>(TYPES.ProviderXDai).toConstantValue(process.env.XDAI_WS_PROVIDER);
container.bind<string>(TYPES.ProviderMainnet).toConstantValue(process.env.MAINNET_WS_PROVIDER);

/* Persistence binds */
container.bind<EventDao>(TYPES.EventDao).to(EventDaoImpl).inSingletonScope();
container.bind<CodeDao>(TYPES.CodeDao).to(CodeDaoImpl).inSingletonScope();
container.bind<UserDao>(TYPES.UserDao).to(UserDaoImpl).inSingletonScope();
container.bind<SubscribedChannelDao>(TYPES.SubscribedChannelDao).to(SubscribedChannelDaoImpl).inSingletonScope();

/* DB Maintenance persistence binds */
container.bind<MaintenanceDB>(TYPES.MaintenanceDB).to(MaintenanceDBImpl).inSingletonScope();

/* Cache binds */
container.bind<TokenCacheService>(TYPES.TokenCacheService).to(TokenCacheServiceImpl).inSingletonScope();
container.bind<AccountCacheService>(TYPES.AccountCacheService).to(AccountCacheServiceImpl).inSingletonScope();

/* Core Services binds */
container.bind<EventService>(TYPES.EventService).to(EventServiceImpl).inSingletonScope();
container.bind<CodeService>(TYPES.CodeService).to(CodeServiceImpl).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserServiceImpl).inSingletonScope();
container.bind<ContractService>(TYPES.ContractService).to(ContractServiceImpl).inSingletonScope();
container.bind<SubscribedChannelService>(TYPES.SubscribedChannelService).to(SubscribedChannelServiceImpl).inSingletonScope();

/* PubSub Services binds */
container.bind<SubscriberService>(TYPES.SubscriberService).to(SubscriberServiceImpl).inSingletonScope();
container.bind<PublisherService>(TYPES.PublisherService).to(PublisherServiceImpl).inSingletonScope();

/* Schedule Services binds */
container.bind<ScheduleService>(TYPES.ScheduleService).to(ScheduleServiceImpl).inSingletonScope();
container.bind<EventScheduleService>(TYPES.EventScheduleService).to(EventScheduleServiceImpl).inSingletonScope();

/* Queue Services binds */
container.bind<TokenQueueService>(TYPES.TokenQueueService).to(TokenQueueServiceImpl).inSingletonScope();
container.bind<TokenWorkerService>(TYPES.TokenWorkerService).to(TokenWorkerServiceImpl).inSingletonScope();

/* Discord Services binds */
container.bind<GuildService>(TYPES.GuildService).to(GuildServiceImpl).inSingletonScope();
container.bind<ChannelService>(TYPES.ChannelService).to(ChannelServiceImpl).inSingletonScope();

/* DB Maintenance Service binds */
container.bind<MaintenanceDBService>(TYPES.MaintenanceDBService).to(MaintenanceDBServiceImpl).inSingletonScope();

container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler).inSingletonScope();
container.bind<InitLoader>(TYPES.InitLoader).to(InitLoader).inSingletonScope();
container.bind<CommandLoader>(TYPES.CommandLoader).to(CommandLoader).inSingletonScope();

export default container;
