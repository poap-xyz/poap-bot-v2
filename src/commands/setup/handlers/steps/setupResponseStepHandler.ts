import {BotConfig} from "../../../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {SetupAbstractHandler} from "./setupAbstractHandler";


export class SetupResponseStepHandler extends SetupAbstractHandler{
    constructor() {
        super('RESPONSE');
    }

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Response to send privately to members during the event? (${BotConfig.defaultResponseMessage})`);
    }

    async handler(message: Message, setupState: SetupState):Promise<string> {
        const messageContent:string = message.content.trim();
        let responseMessage: string;

        if (messageContent === BotConfig.defaultOptionMessage)
            responseMessage = BotConfig.defaultResponseMessage;

        if(!messageContent || !messageContent.length){
            await setupState.dmChannel.send(`Please provide a response or send '-' for default `);
            return Promise.reject("Invalid response (null or empty)");
        }

        setupState.event.setResponseMessage(responseMessage);
        return responseMessage;
    }
}
