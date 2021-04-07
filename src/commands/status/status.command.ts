import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {TYPES} from "../../config/types";
import {EventService} from "../../interfaces/services/core/eventService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {Message, Permissions} from "discord.js";
import {logger} from "../../logger";
import {Event} from "../../models/event";
import {CodeService} from "../../interfaces/services/core/codeService";
import {EventScheduleService, TimeToEvent} from "../../interfaces/services/schedule/eventScheduleService";
const { lazyInject } = getDecorators(container);

export default class InstructionsCommand extends Command{
    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.CodeService) readonly codeService: CodeService;
    @lazyInject(TYPES.EventScheduleService) readonly eventScheduleService: EventScheduleService;

    constructor() {
        super("status",
            {aliases: ["stat", "stats", "schedule"],
                commandType: {DMCommand: true, GuildCommand: true},
                botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
                memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]})
    }

    protected async execute(commandContext: CommandContext): Promise<Message> {
        const guild = commandContext.message.guild;
        const response = commandContext.message.reply("Please check your DM.");
        try {
            const events = await this.eventService.getGuildEvents(guild.id);
            console.log(JSON.stringify(events))
            console.log(guild.id)
            if(!events || events.length === 0)
                return await commandContext.message.author.send("There are no events scheduled in this server.");
            for (const event of events) {
                const formattedEvent = await this.getFormattedEvent(event);
                await commandContext.message.author.send(formattedEvent);
            }
        }catch (e){
            logger.error(`[StatusCommand] Error fetching guild events, error: ${e}`);
            await commandContext.message.reply("Error fetching status, please try again in a few minutes.");
        }
        return response;
    }

    private async getFormattedEvent(event: Event): Promise<string> {
        if (!event)
            return undefined;

        const timeToEvent = this.eventScheduleService.getTimeToEvent(event);
        const eventStatus = InstructionsCommand.getEventStatus(event, timeToEvent);

        const totalCodes = await this.codeService.countTotalCodes(event.id);
        const claimedCodes = await this.codeService.countClaimedCodes(event.id);

        return `Event in guild: ${event.server}
                Channel: ${event.channel}
                Start: ${event.start_date}
                End: ${event.end_date}
                Response to member messages: ${event.response_message}
                Pass to get the code: ${event.pass}
                Codes url: ${event.file_url}
                Total Codes: ${totalCodes}
                Claimed Codes: ${claimedCodes}
                ${eventStatus}`;
    }

    private static getEventStatus(event: Event, timeToEvent: TimeToEvent){
        const now = new Date();
        if(!timeToEvent)
            return (now < event.end_date)? `Event not scheduled :'(` : `Event finished`;

        if(timeToEvent.startSecs > 0)
            return `Event will start in ${timeToEvent.startSecs} seconds`;

        if(timeToEvent.endSecs > 0)
            return `Event will end in ${timeToEvent.startSecs} seconds`;

        return `Event finished`;
    }
}