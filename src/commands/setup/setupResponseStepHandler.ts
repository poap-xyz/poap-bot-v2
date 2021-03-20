import {BotConfig} from "../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";


export class SetupResponseStepHandler implements SetupStep{
    readonly stepId: SetupStepId = 'RESPONSE';

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Response to send privately to members during the event? (${BotConfig.defaultResponseMessage})`);
    }

    async handler(messageContent:string, setupState: SetupState):Promise<string> {
        let responseMessage: string;

        if (messageContent === BotConfig.defaultOptionMessage)
            responseMessage = BotConfig.defaultResponseMessage;

        if(!messageContent || !messageContent.length){
            await setupState.dmChannel.send(`Please provide a response or send '-' for default `);
            return Promise.reject("Invalid response (null or empty)")
        }

        setupState.event.setResponseMessage(responseMessage);
        return responseMessage;
    }
}
