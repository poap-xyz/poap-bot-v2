import {Message} from "discord.js";
import {PingFinder} from "../../commands/ping-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";

@injectable()
export class MessageHandler {
    private pingFinder: PingFinder;

    constructor(@inject(TYPES.PingFinder) pingFinder: PingFinder) {
        this.pingFinder = pingFinder;
    }

    handle(message: Message): Promise<Message | Message[]> {
        if (this.pingFinder.isPing(message.content)) {
            return message.reply('pong!');
        }

        return Promise.reject();
    }
}
