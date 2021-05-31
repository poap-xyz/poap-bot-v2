import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {BotEventInputBuilder} from "../../models/builders/botEventInputBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {BotEventInput} from "../../models/input/botEventInput";
import {BotEvent} from "../../models/core/botEvent";
import {EventABM, EventABMStep, EventState} from "../../interfaces/command/event/eventABM.interface";
import EventABMAbstractCommand from "./eventABMAbstractCommand";
import {CommandContext} from "../commandContext";
import {ModifyDMChannelCallback} from "./handlers/callback/modifyDMChannelCallback";
import {SetupDMChannelCallback} from "./handlers/callback/setupDMChannelCallback";

export default class SetupCommand extends EventABMAbstractCommand{
    constructor() {
        super("setup",
            {aliases: ["createevent", "newevent"],
                        commandType: {DMCommand: false, GuildCommand: true},
                        botPermissions: [],
                        memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]},
            2);
        this.dmChannelCallback = new SetupDMChannelCallback(this);
    }

    protected getInitialEventState(user: User, guild: Guild, commandContext: CommandContext): EventState{
        const message = commandContext.message;
        const defaultEventInput: BotEventInputBuilder = new BotEventInputBuilder()
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
        await eventState.dmChannel.send(`Hi ${eventState.user.username}! You want to set me up for an event in ${eventState.guild}? I'll ask for the details, one at a time.`);
        await eventState.dmChannel.send(`To accept the suggested value, respond with "${BotConfig.defaultOptionMessage}"`);
        await this.dmChannelCallback.sendInitMessage(eventState);
    }

    public async saveEvent(eventState: EventState): Promise<Message>{
        logger.info(`[SetupCommand] Saving event for user id ${eventState.user.id} and guild id ${eventState.guild.id}`);
        logger.debug(`[SetupCommand] Saving event: ${JSON.stringify(eventState.event)}`);
        const event: BotEventInput = eventState.event.build();
        try {
            const savedEvent = await this.eventService.saveEvent(event);
            await this.eventScheduleService.scheduleEvent(savedEvent);
            return SetupCommand.checkSavedEvent(eventState, event, savedEvent);
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
