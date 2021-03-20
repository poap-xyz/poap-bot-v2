import {Message, User} from "discord.js";
import {SetupState} from "../../interfaces/command/setup/setup.interface";
import {logger} from "../../logger";
import {Event} from "../../models/event";
import Setup from "./setup.command";
import {EventService} from "../../interfaces/services/eventService";
import {DMChannelHandler} from "../../interfaces/command/DMChannelHandler";

export class SetupDMChannelHandler implements DMChannelHandler{
    private readonly setup: Setup;
    private readonly eventService: EventService;

    constructor(setup: Setup, eventService: EventService){
        this.setup = setup;
        this.eventService = eventService;
    }

    public async DMChannelHandler(message: Message, user: User): Promise<Message>{
        const setupState: SetupState = this.setup.getSetupStateByUser(user.id);
        const messageContent = message.content.trim();
        logger.debug(`DM Handler, message content: ${message.content}, step: ${setupState.step}`);
        if(setupState.step > this.setup.setupSteps.length)
            return undefined; //TODO return anything else here

        try {
            await this.setup.setupSteps[setupState.step].handler(messageContent, setupState);
            return await SetupDMChannelHandler.nextSetupStep(setupState, this.setup);
        }catch (e) {
            logger.error(`Invalid setup step, error: ${e}`)
        }

        return Promise.reject();
    }

    private static async nextSetupStep(setupState: SetupState, setup: Setup): Promise<Message>{
        setupState.step++;
        if(setupState.step < setup.setupSteps.length){
            return await setup.setupSteps[setupState.step].sendInitMessage(setupState);
        }
        await setup.clearSetupState(setupState);
        return await setup.saveEvent(setupState);
    }

}