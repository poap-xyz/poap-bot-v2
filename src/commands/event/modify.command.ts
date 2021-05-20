import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {BotEventBuilder} from "../../models/builders/botEventBuilder";
import {EventState} from "../../interfaces/command/event/eventABM.interface";
import EventABMAbstractCommand from "./eventABMAbstractCommand";
import {CommandContext} from "../commandContext";
import {ModifyDMChannelCallback} from "./handlers/callback/modifyDMChannelCallback";

export default class ModifyCommand extends EventABMAbstractCommand{
    constructor() {
        super("modify", {aliases: ["modifyevent", "change", "changeevent"],
            commandType: {DMCommand: false, GuildCommand: true},
            botPermissions: [],
            memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
        this.dmChannelCallback = new ModifyDMChannelCallback(this);
    }

    protected getInitialEventState(user: User, guild: Guild, commandContext: CommandContext): EventState{
        const message = commandContext.message;
        const defaultEventInput: BotEventBuilder = new BotEventBuilder()
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
        await eventState.dmChannel.send(`Hi ${eventState.user.username}! You want to modify the event (ID#${eventState.event.id}) in ${eventState.guild.name}? I'll ask for the details, one at a time.`);
        await eventState.dmChannel.send(`To leave the current value, please skip the step by using "${BotConfig.defaultOptionMessage}"`);
        await this.dmChannelCallback.sendInitMessage(eventState);
    }

    public async saveEvent(eventState: EventState): Promise<Message>{
        logger.info(`[ModifyCommand] Modifying event for user id ${eventState.user.id} and guild id ${eventState.guild.id}`);
        logger.debug(`[ModifyCommand] Modifying event: ${JSON.stringify(eventState.event)}`);
        const event = eventState.event.build();

        /* Type check for secure programming */
        if(!("id" in event))
            throw new Error("Invalid type for modify command");

        try {
            const savedEvent = await this.eventService.updateEvent(event);
            this.eventScheduleService.cancelEvent(event);
            await this.eventScheduleService.scheduleEvent(savedEvent);
            return await eventState.dmChannel.send(`Thank you. That's everything. I'll start the event at the appointed time.`);
        }catch(e){
            logger.error(`[ModifyCommand] Error modifying event ${JSON.stringify(event)}, error: ${e}`);
            return await eventState.dmChannel.send(`Something went wrong, please try again in a few minutes or contact support.`);
        }
    }
}
