import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {EventInputBuilder} from "../../models/builders/eventInputBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {BotEventInput} from "../../models/input/botEventInput";
import {BotEvent} from "../../models/core/botEvent";
import {EventABM, EventABMStep, EventState} from "../../interfaces/command/event/eventABM.interface";
import EventABMAbstractCommand from "./eventABMAbstractCommand";
import {CommandContext} from "../commandContext";

export default class ModifyCommand extends EventABMAbstractCommand{
    constructor() {
        super("modify", {aliases: ["modifyevent", "change", "changeevent"],
            commandType: {DMCommand: false, GuildCommand: true},
            botPermissions: [],
            memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
    }

    protected getInitialEventState(user: User, guild: Guild, commandContext: CommandContext): EventState{
        const message = commandContext.message;
        const defaultEventInput: EventBuilder = new EventInputBuilder()
            .setCreatedDate(new Date())
            .setCreatedBy(user.id)
            .setServer(guild.id);

        return {
            step: 0,
            user: user,
            guild: guild,
            channel: message.channel,
            dmChannel: undefined,
            event: defaultEventInput
        };
    }

    protected async sendInitialDM(eventState: EventState){
        await eventState.dmChannel.send(`Hi ${eventState.user.username}! You want to modify the event (#${eventState.event}) in ${eventState.guild}? I'll ask for the details, one at a time.`);
        await eventState.dmChannel.send(`To leave the current value, please skip the step by using "${BotConfig.defaultOptionMessage}"`);
        await this.setupDMChannelHandler.sendInitMessage(eventState);
    }

    public async saveEvent(eventState: EventState): Promise<Message>{
        logger.info(`[SetupCommand] Modifying event for user id ${eventState.user.id} and guild id ${eventState.guild.id}`);
        logger.debug(`[SetupCommand] Modifying event: ${JSON.stringify(eventState.event)}`);
        const eventInput: BotEventInput = eventState.event.build();
        const event: BotEvent = {...eventInput,
                                    is_active: true,
                                    id:
                                    };
        try {
            const savedEvent = await this.eventService.updateEvent(event);
            await this.eventScheduleService.scheduleEvent(savedEvent);
            return ModifyCommand.checkSavedEvent(eventState, event, savedEvent);
        }catch(e){
            logger.error(`[SetupCommand] Error saving event, error: ${e}`);
            return await eventState.dmChannel.send(`Something went wrong, please try again in a few minutes or contact support.`);
        }
    }

    private static async checkSavedEvent(eventState: EventState, eventInput: BotEventInput, savedEvent: BotEvent): Promise<Message>{
        logger.info(`[SetupCommand] Saved event: ${JSON.stringify(savedEvent)}`);
        if(eventInput.codes.length !== savedEvent.codes.length)
            return await eventState.dmChannel.send(`Event saved but some codes may be repeated. Please check with command !status and !addcodes ${savedEvent.id} to add more codes!`);

        return await eventState.dmChannel.send(`Thank you. That's everything. I'll start the event at the appointed time.`);
    }
}
