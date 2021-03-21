import * as moment from "moment";
import {BotConfig} from "../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";

export class SetupDateStartStepHandler implements SetupStep{
    readonly stepId: SetupStepId = 'START';

    async sendInitMessage(setupState: SetupState): Promise<Message>{
        return await setupState.dmChannel.send(`Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm`);
    }

    async handler(message: Message, setupState: SetupState):Promise<string> {
        const messageContent:string = message.content.trim();
        let startDate = SetupDateStartStepHandler.validateStartDate(messageContent);
        if(!startDate){
            await setupState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);
            return Promise.reject(`Invalid date, message content: ${messageContent}`)
        }

        setupState.event = setupState.event.setStartDate(startDate);
        return startDate.toUTCString();
    }

    private static validateStartDate(messageContent: string): Date{
        const defaultDate = new Date();

        if (messageContent === BotConfig.defaultOptionMessage)
            return defaultDate;

        if(moment(messageContent).isValid()){
            return new Date(messageContent);
        }

        return undefined;
    }
}
