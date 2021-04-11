import {Message, User} from "discord.js";
import {SetupState, SetupStep} from "../../../interfaces/command/setup/setup.interface";
import {logger} from "../../../logger";
import {BotEvent} from "../../../models/core/event";
import Setup from "../setup.command";
import {EventService} from "../../../interfaces/services/core/eventService";
import {DMChannelCallback} from "../../../interfaces/callback/DMChannelCallback";
import {SetupChannelStepHandler} from "./steps/setupChannelStepHandler";
import {SetupDateStartStepHandler} from "./steps/setupDateStartStepHandler";
import {SetupDateEndStepHandler} from "./steps/setupDateEndStepHandler";
import {SetupResponseStepHandler} from "./steps/setupResponseStepHandler";
import {SetupPassStepHandler} from "./steps/setupPassStepHandler";
import {SetupFileStepHandler} from "./steps/setupFileStepHandler";
import {ChannelService} from "../../../interfaces/services/discord/channelService";

export class SetupDMChannelHandler implements DMChannelCallback{
    private readonly setup: Setup;
    private readonly setupSteps: SetupStep[];
    private readonly eventService: EventService;
    private readonly channelService: ChannelService;

    constructor(setup: Setup){
        this.setup = setup;
        this.eventService = setup.eventService;
        this.channelService = setup.channelService;
        this.setupSteps = this.initializeSetupStepsList();
    }

    private initializeSetupStepsList(): SetupStep[]{
        return [
            new SetupChannelStepHandler(this.channelService),
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
        if(!setupState){
            logger.info(`DM Handler, setup not found for user ${user.id}, closing DM Channel...`);
            await this.setup.clearSetupState(user);
            return message.channel.send("No setup found, please try again sending the !setup command.")
        }

        logger.debug(`DM Handler, message content: ${message.content}, step: ${setupState.step}`);
        if(setupState.step > this.setupSteps.length)
            return undefined;

        try {
            await this.setupSteps[setupState.step].handler(message, setupState);
            return await this.nextSetupStep(setupState, this.setup);
        }catch (e) {
            logger.error(`Invalid setup step, error: ${e}`);
        }

        return undefined;
    }

    private async nextSetupStep(setupState: SetupState, setup: Setup): Promise<Message>{
        setupState.step++;
        if(setupState.step < this.setupSteps.length){
            return await this.setupSteps[setupState.step].sendInitMessage(setupState);
        }

        await setup.clearSetupState(setupState.user);
        return await setup.saveEvent(setupState);
    }

}