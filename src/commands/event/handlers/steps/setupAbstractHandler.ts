import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";

export abstract class SetupAbstractHandler implements EventABMStep{
    readonly stepId: EventABMStepId;

    protected constructor(stepId: EventABMStepId) {
        this.stepId = stepId;
    }

    async sendErrorMessage(eventState: EventState): Promise<Message> {
        return await eventState.dmChannel.send(`Server side error. Please try in a few minutes or contact support.`);
    }

    abstract handler(message: Message, eventState: EventState): Promise<string>;

    abstract sendInitMessage(eventState: EventState): Promise<Message>;

}