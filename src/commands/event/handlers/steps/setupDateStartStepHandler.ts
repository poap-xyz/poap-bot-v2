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

    async sendInitMessage(eventState: EventState): Promise<Message>{
        const hintDate = moment(new Date()).add(1, "h").format("YYYY-MM-DD HH:mm");
        return await eventState.dmChannel.send(`Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm (${hintDate})`);
    }

    async handler(message: Message, eventState: EventState):Promise<string> {
        const messageContent:string = message.content.trim();
        let startDate = SetupDateStartStepHandler.validateStartDate(messageContent, eventState);
        if(!startDate){
            await eventState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);
            return Promise.reject(`Invalid date, message content: ${messageContent}`)
        }

        eventState.event = eventState.event.setStartDate(startDate);
        return startDate.toUTCString();
    }

    private static validateStartDate(messageContent: string, eventState: EventState): Date{
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 1);

        if (messageContent === BotConfig.defaultOptionMessage)
            return eventState.event.startDate? eventState.event.startDate : defaultDate;
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
