import * as moment from "moment";
import {BotConfig} from "../../config/bot.config";
import {SetupState} from "./setup.command";

export class SetupDateStepHandler{
    public static startDateStepHandler(messageContent: string, setupState: SetupState){
        let startDate = this.validateDate(messageContent);
        if(!startDate)
            return setupState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);

        setupState.event = setupState.event.setStartDate(startDate);
        setupState.step = 'END';
        return setupState.dmChannel.send(`Date and time to END 🛬  the event? (${( moment(startDate)
            .add(1, "h")
            .format("YYYY-MM-DD HH:mm")) || ""})`);
    }

    public static endDateStepHandler(messageContent: string, setupState: SetupState){
        let endDate = this.validateDate(messageContent);
        if(!endDate)
            return setupState.dmChannel.send(`mmmm ${messageContent} It's a valid date? Try again 🙏`);

        setupState.event = setupState.event.setEndDate(endDate);
        setupState.step = 'RESPONSE';
        return setupState.dmChannel.send(`Response to send privately to members during the event? (${BotConfig.defaultResponseMessage})`); //TODO add default message here
    }

    private static validateDate(messageContent: string, defaultDate?: Date): Date{
        if(!defaultDate)
            defaultDate = new Date();

        if (messageContent === BotConfig.defaultOptionMessage)
            return defaultDate;

        if(moment(messageContent).isValid()){
            return new Date(messageContent);
        }

        return undefined;
    }
}
