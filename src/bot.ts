import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./config/types";
import {MessageHandler} from "./discord/events/messageHandler";
import {logger} from "./logger";
import * as pino from "pino";
import * as path from "path";
import {CommandLoader} from "./discord/loaders/commandLoader";
import {InitLoader} from "./discord/events/initLoader";

@injectable()
export class Bot {
    private readonly client: Client;
    private readonly token: string;
    private readonly messageHandler: MessageHandler;
    private readonly initHandler: InitLoader;
    private readonly commandLoader: CommandLoader;

    constructor(@inject(TYPES.Client) client: Client,
                @inject(TYPES.Token) token: string,
                @inject(TYPES.MessageHandler) messageHandler: MessageHandler,
                @inject(TYPES.InitLoader) initLoader: InitLoader,
                @inject(TYPES.CommandLoader) commandLoader: CommandLoader) {
        this.client = client;
        this.token = token;
        this.messageHandler = messageHandler;
        this.initHandler = initLoader;
        this.commandLoader = commandLoader;
    }

    public async init(){
        await this.commandLoader.init();
        await this.initHandler.init();
        await this.listen();
    }

    private listen(): Promise<string> {
        this.client.on('message', (message: Message) => {
            logger.debug(`Message received! Contents: ${message.content}`);

        this.messageHandler.handle(message).then((m) => {
                logger.debug(`Message responded, Content: ${m}`);
            }).catch((e) => {
                logger.debug(`Message not responded, Cause:${e}`);
            })
        });

        return this.client.login(this.token);
    }
}
