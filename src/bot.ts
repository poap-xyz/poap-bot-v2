import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./config/types";
import {MessageHandler} from "./services/events/message-handler";

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;
    private messageResponder: MessageHandler;

    constructor(@inject(TYPES.Client) client: Client, @inject(TYPES.Token) token: string,
                @inject(TYPES.MessageResponder) messageResponder: MessageHandler) {
        this.client = client;
        this.token = token;
        this.messageResponder = messageResponder;
    }

    public listen(): Promise<string> {
        this.client.on('message', (message: Message) => {
            if (message.author.bot) {
                console.log('Ignoring bot message!')
                return;
            }

            console.log("Message received! Contents: ", message.content);

        this.messageResponder.handle(message).then(() => {
                console.log("Response sent!");
            }).catch(() => {
                console.log("Response not sent.")
            })
        });

        return this.client.login(this.token);
    }
}
