import moment from 'moment'
import {BotConfig} from "../../../../config/bot.config";
import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";
import {SetupAbstractHandler} from "./setupAbstractHandler";

export class SetupDateEndStepHandler extends SetupAbstractHandler{
    constructor() {
        super('END');
    }

    async sendInitMessage(EventState: EventState): Promise<Message>{
        const hintDate = moment(EventState.event.start_date).add(1, "h").format("YYYY-MM-DD HH:mm");
        return await EventState.dmChannel.send(`Date and time to END 🛬  the event? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm (${hintDate})`);
    }

    async handler(message: Message, EventState: EventState):Promise<string> {
        const messageContent:string = message.content.trim();
        let endDate = SetupDateEndStepHandler.validateEndDate(messageContent, EventState.event.start_date);
        if(!endDate){
            await EventState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);
            return Promise.reject(`Invalid date, message content: ${messageContent}`)
        }

        EventState.event = EventState.event.setEndDate(endDate);
        return endDate.toUTCString();
    }

    private static validateEndDate(messageContent: string, startDate: Date): Date{
        const defaultDate = new Date(startDate);
        defaultDate.setHours(startDate.getHours() + 1);

        if (messageContent === BotConfig.defaultOptionMessage)
            return defaultDate;

        const endDate = moment(messageContent).isValid() && new Date(messageContent);
        if(endDate && endDate > startDate){
            return endDate;
        }

        return undefined;
    }
}