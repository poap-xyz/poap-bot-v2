import moment from 'moment'
import {BotConfig} from "../../../../config/bot.config";
import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {logger} from "../../../../logger";

export class SetupDateStartStepHandler extends SetupAbstractHandler{
    constructor() {
        super('START');
    }

    async sendInitMessage(EventState: EventState): Promise<Message>{
        const hintDate = moment(new Date()).add(1, "h").format("YYYY-MM-DD HH:mm");
        return await EventState.dmChannel.send(`Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm (${hintDate})`);
    }

    async handler(message: Message, EventState: EventState):Promise<string> {
        const messageContent:string = message.content.trim();
        let startDate = SetupDateStartStepHandler.validateStartDate(messageContent);
        if(!startDate){
            await EventState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);
            return Promise.reject(`Invalid date, message content: ${messageContent}`)
        }

        EventState.event = EventState.event.setStartDate(startDate);
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
            logger.error(`[StartDateEventABMStep] Invalid date in message: ${messageContent}, error: ${e} `);
        }

        return undefined;
    }
}
