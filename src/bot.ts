import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./config/types";
import {MessageHandler} from "./discord/events/messageHandler";
import {logger} from "./logger";
import {CommandLoader} from "./discord/loaders/commandLoader";
import {InitLoader} from "./discord/events/initLoader";

@injectable()
export class Bot {
    private readonly client: Client;
    private readonly token: string;
    private readonly messageHandler: MessageHandler;
    private readonly initHandler: InitLoader;
    constructor(@inject(TYPES.Client) client: Client,
                @inject(TYPES.Token) token: string,
                @inject(TYPES.MessageHandler) messageHandler: MessageHandler,
                @inject(TYPES.InitLoader) initLoader: InitLoader) {
        this.client = client;
        this.token = token;
        this.messageHandler = messageHandler;
        this.initHandler = initLoader;
    }

    public async init(){
        await this.configBotEventListeners();
    }

    private configBotEventListeners(): Promise<string> {
        this.client.on('ready', async () => {
            await this.initHandler.init();
        });

        this.client.on('message', (message: Message) => {
            logger.info(`[MSG] DM ${message.channel.type} - ${message.content} from ${message.author.username}`);
            this.messageHandler.handle(message).then((m) => {
                logger.info(`Message responded, Content: ${m}`);
            }).catch((e) => {
                logger.info(`Message not responded, Cause: ${e}`);
            })
        });

        return this.client.login(this.token);
    }
}
