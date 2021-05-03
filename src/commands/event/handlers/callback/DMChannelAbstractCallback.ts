import {DMChannel, Message, User} from "discord.js";
import {EventABM, EventABMStep, EventState} from "../../../../interfaces/command/event/eventABM.interface";
import {EventService} from "../../../../interfaces/services/core/eventService";
import {ChannelService} from "../../../../interfaces/services/discord/channelService";
import {logger} from "../../../../logger";
import {DMChannelCallback} from "../../../../interfaces/callback/DMChannelCallback";

export abstract class DMChannelAbstractCallback implements DMChannelCallback{
    protected readonly eventABM: EventABM;
    protected readonly eventABMSteps: EventABMStep[];
    protected readonly eventService: EventService;
    protected readonly channelService: ChannelService;

    protected constructor(eventABM: EventABM){
        this.eventABM = eventABM;
        this.eventService = eventABM.eventService;
        this.channelService = eventABM.channelService;
        this.eventABMSteps = this.initializeEventABMStepsList();
    }

    protected abstract initializeEventABMStepsList(): EventABMStep[];

    async sendInitMessage(eventState: EventState): Promise<Message>{
        return await this.eventABMSteps[eventState.step].sendInitMessage(eventState);
    }

    async DMCallback(message: Message, user: User): Promise<Message>{
        const eventState: EventState = this.eventABM.getEventStateByUser(user.id);
        if(!eventState){
            logger.info(`DM Handler, setup not found for user ${user.id}, closing DM Channel...`);
            await this.eventABM.clearEventState(user);
            return message.channel.send("No setup found, please try again sending the !setup command.")
        }

        logger.debug(`DM Handler, message content: ${message.content}, step: ${eventState.step}`);
        if(eventState.step > this.eventABMSteps.length){
            logger.error(`[DMChannelCallback] Step does not exists, please check the user ${user.id}`);
            await this.eventABM.clearEventState(eventState.user);
            return undefined;
        }

        try {
            await this.eventABMSteps[eventState.step].handler(message, eventState);
            return await this.nextEventABMStep(eventState);
        }catch (e) {
            logger.error(`Invalid setup step, error: ${e}`);
        }

        return undefined;
    }

    private async nextEventABMStep(eventState: EventState): Promise<Message>{
        eventState.step++;
        if(eventState.step < this.eventABMSteps.length){
            return await this.eventABMSteps[eventState.step].sendInitMessage(eventState);
        }

        /* No more steps, we save the changes */
        await this.eventABM.clearEventState(eventState.user);
        return await this.eventABM.saveEvent(eventState);
    }

}
