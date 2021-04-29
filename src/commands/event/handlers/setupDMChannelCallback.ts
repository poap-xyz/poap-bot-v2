import {Message, User} from "discord.js";
import {EventState, EventABMStep} from "../../../interfaces/command/event/eventABM.interface";
import {logger} from "../../../logger";
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

export class SetupDMChannelCallback implements DMChannelCallback{
    private readonly setup: Setup;
    private readonly EventABMSteps: EventABMStep[];
    private readonly eventService: EventService;
    private readonly channelService: ChannelService;

    constructor(setup: Setup){
        this.setup = setup;
        this.eventService = setup.eventService;
        this.channelService = setup.channelService;
        this.EventABMSteps = this.initializeEventABMStepsList();
    }

    private initializeEventABMStepsList(): EventABMStep[]{
        return [
            new SetupChannelStepHandler(this.channelService),
            new SetupDateStartStepHandler(),
            new SetupDateEndStepHandler(),
            new SetupResponseStepHandler(),
            new SetupPassStepHandler(this.eventService),
            new SetupFileStepHandler(),
        ];
    }

    public async sendInitMessage(EventState: EventState): Promise<Message>{
        return await this.EventABMSteps[EventState.step].sendInitMessage(EventState);
    }

    async DMCallback(message: Message, user: User): Promise<Message>{
        const EventState: EventState = this.setup.getEventStateByUser(user.id);
        if(!EventState){
            logger.info(`DM Handler, setup not found for user ${user.id}, closing DM Channel...`);
            await this.setup.clearEventState(user);
            return message.channel.send("No setup found, please try again sending the !setup command.")
        }

        logger.debug(`DM Handler, message content: ${message.content}, step: ${EventState.step}`);
        if(EventState.step > this.EventABMSteps.length)
            return undefined;

        try {
            await this.EventABMSteps[EventState.step].handler(message, EventState);
            return await this.nextEventABMStep(EventState, this.setup);
        }catch (e) {
            logger.error(`Invalid setup step, error: ${e}`);
        }

        return undefined;
    }

    private async nextEventABMStep(EventState: EventState, setup: Setup): Promise<Message>{
        EventState.step++;
        if(EventState.step < this.EventABMSteps.length){
            return await this.EventABMSteps[EventState.step].sendInitMessage(EventState);
        }

        await setup.clearEventState(EventState.user);
        return await setup.saveEvent(EventState);
    }

}
