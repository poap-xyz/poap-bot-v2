import {Message, User} from "discord.js";
import {SetupState, SetupStep} from "../../../interfaces/command/setup/setup.interface";
import {logger} from "../../../logger";
import {Event} from "../../../models/event";
import Setup from "../setup.command";
import {EventService} from "../../../interfaces/services/core/eventService";
import {DMChannelCallback} from "../../../interfaces/DMChannelCallback";
import {SetupChannelStepHandler} from "./steps/setupChannelStepHandler";
import {SetupDateStartStepHandler} from "./steps/setupDateStartStepHandler";
import {SetupDateEndStepHandler} from "./steps/setupDateEndStepHandler";
import {SetupResponseStepHandler} from "./steps/setupResponseStepHandler";
import {SetupPassStepHandler} from "./steps/setupPassStepHandler";
import {SetupFileStepHandler} from "./steps/setupFileStepHandler";

export class SetupDMChannelHandler implements DMChannelCallback{
    private readonly setup: Setup;
    private readonly setupSteps: SetupStep[];
    private readonly eventService: EventService;

    constructor(setup: Setup, eventService: EventService){
        this.setup = setup;
        this.eventService = eventService;
        this.setupSteps = this.initializeSetupStepsList();
    }

    private initializeSetupStepsList(): SetupStep[]{
        return [
            new SetupChannelStepHandler(),
            new SetupDateStartStepHandler(),
            new SetupDateEndStepHandler(),
            new SetupResponseStepHandler(),
            new SetupPassStepHandler(this.eventService),
            new SetupFileStepHandler(),
        ];
    }

    public async sendInitMessage(setupState: SetupState): Promise<Message>{
        return await this.setupSteps[setupState.step].sendInitMessage(setupState);
    }

    async DMCallback(message: Message, user: User): Promise<Message>{
        const setupState: SetupState = this.setup.getSetupStateByUser(user.id);

        logger.debug(`DM Handler, message content: ${message.content}, step: ${setupState.step}`);
        if(setupState.step > this.setupSteps.length)
            return undefined;

        try {
            await this.setupSteps[setupState.step].handler(message, setupState);
            return await this.nextSetupStep(setupState, this.setup);
        }catch (e) {
            logger.error(`Invalid setup step, error: ${e}`);
        }
        return await this.setupSteps[setupState.step].sendErrorMessage(setupState);
    }

    private async nextSetupStep(setupState: SetupState, setup: Setup): Promise<Message>{
        setupState.step++;
        if(setupState.step < this.setupSteps.length){
            return await this.setupSteps[setupState.step].sendInitMessage(setupState);
        }

        await setup.clearSetupState(setupState);
        return await setup.saveEvent(setupState);
    }

}