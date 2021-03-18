import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./config/types";
import {MessageHandler} from "./services/events/messageHandler";
import * as pino from "pino";
import * as path from "path";

@injectable()
export class Bot {
    private readonly client: Client;
    private readonly token: string;
    private readonly messageHandler: MessageHandler;
    @inject(TYPES.Logger) private logger: pino.Logger;

    constructor(@inject(TYPES.Client) client: Client,
                @inject(TYPES.Token) token: string,
                @inject(TYPES.MessageHandler) messageHandler) {
        this.client = client;
        this.token = token;
        this.messageHandler = messageHandler;
    }

    public async init(){
        await this.listen();
    }

    private listen(): Promise<string> {
        this.client.on('message', (message: Message) => {
            this.logger.debug(`Message received! Contents: ${message.content}`);

        this.messageHandler.handle(message).then((m) => {
                this.logger.debug(`Message responded, Content: ${m}`);
            }).catch((e) => {
                this.logger.debug(`Message not responded, Cause:${e}`);
            })
        });

        return this.client.login(this.token);
    }
}
