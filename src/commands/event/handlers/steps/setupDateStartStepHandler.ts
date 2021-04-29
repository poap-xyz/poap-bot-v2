import moment from 'moment'
import {BotConfig} from "../../../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {logger} from "../../../../logger";

export class SetupDateStartStepHandler extends SetupAbstractHandler{
    constructor() {
        super('START');
    }

    async sendInitMessage(setupState: SetupState): Promise<Message>{
        const hintDate = moment(new Date()).add(1, "h").format("YYYY-MM-DD HH:mm");
        return await setupState.dmChannel.send(`Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm (${hintDate})`);
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
        defaultDate.setHours(defaultDate.getHours() + 1);

        if (messageContent === BotConfig.defaultOptionMessage)
            return defaultDate;
        try {
            if (moment(messageContent).isValid()) {
                return new Date(messageContent);
            }
        }catch (e){
            logger.error(`[StartDateSetupStep] Invalid date in message: ${messageContent}, error: ${e} `);
        }

        return undefined;
    }
}
