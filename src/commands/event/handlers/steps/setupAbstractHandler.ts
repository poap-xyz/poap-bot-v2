import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";

export abstract class SetupAbstractHandler implements SetupStep{
    readonly stepId: SetupStepId;

    protected constructor(stepId: SetupStepId) {
        this.stepId = stepId;
    }

    async sendErrorMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Server side error. Please try in a few minutes or contact support.`);
    }

    abstract handler(message: Message, setupState: SetupState): Promise<string>;

    abstract sendInitMessage(setupState: SetupState): Promise<Message>;

}