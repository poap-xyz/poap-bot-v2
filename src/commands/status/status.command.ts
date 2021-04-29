import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {TYPES} from "../../config/types";
import {EventService} from "../../interfaces/services/core/eventService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {Channel, DMChannel, Guild, GuildChannel, Message, MessageEmbed, Permissions} from "discord.js";
import {logger} from "../../logger";
import {BotEvent} from "../../models/core/botEvent";
import {CodeService} from "../../interfaces/services/core/codeService";
import {EventScheduleService, TimeToEvent} from "../../interfaces/services/schedule/eventScheduleService";
import {GuildService} from "../../interfaces/services/discord/guildService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {BotConfig} from "../../config/bot.config";
const { lazyInject } = getDecorators(container);

export default class StatusCommand extends Command{
    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.CodeService) readonly codeService: CodeService;
    @lazyInject(TYPES.GuildService) readonly guildService: GuildService;
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.EventScheduleService) readonly eventScheduleService: EventScheduleService;

    constructor() {
        super("status",
            {aliases: ["stat", "stats", "schedule"],
                commandType: {DMCommand: true, GuildCommand: true},
                botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
                memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]})
    }

    protected async execute(commandContext: CommandContext): Promise<Message> {

        if(!(commandContext.message.channel instanceof DMChannel))
            await commandContext.message.reply("Please check your DM.");

        try {
            const events = await this.getEventsByUserOrGuild(commandContext);

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

        return;
    }

    private getEventsByUserOrGuild(commandContext: CommandContext){
        const guild = commandContext.message.guild;
        if(guild && guild.id)
            return this.eventService.getGuildEvents(guild.id);

        return this.eventService.getUserEvents(commandContext.message.author.id);
    }

    private async getFormattedEvent(event: BotEvent): Promise<MessageEmbed> {
        if (!event)
            return undefined;
        const timeToEvent = this.eventScheduleService.getTimeToEvent(event);
        const totalCodes = await this.codeService.countTotalCodes(event.id);
        const claimedCodes = await this.codeService.countClaimedCodes(event.id);
        const guild = await this.guildService.getGuildById(event.server);
        const channel = await this.channelService.getChannelFromGuild(guild, event.channel);

        return StatusCommand.getStatusEmbed(event, guild, channel, timeToEvent, totalCodes, claimedCodes);
    }

    private static getStatusEmbed(event: BotEvent, guild: Guild, channel: GuildChannel, timeToEvent: TimeToEvent, totalCodes: number, claimedCodes: number){
        const eventStatus = StatusCommand.getEventStatus(event, timeToEvent);

        return new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Event #${event.id}`)
            .setDescription(`Event status: ${eventStatus}`)

            .addField('Guild', `${guild.name} (${event.server})`, false)
            .addField('Channel', `${channel.name} (${event.channel})`, false)
            .addField('Start date', `${event.start_date}`, false)
            .addField('End date', `${event.end_date}`, false)
            .addField('Response to members', `${event.response_message}`, false)
            .addField('Pass to get claim code', `${event.pass}`, true)
            .addField('Codes CSV', `${event.file_url}`, true)
            .addField('\u200b', '\u200b', false)
            .addField('Claimed codes', `${claimedCodes}`, true)
            .addField('Total codes', `${totalCodes}`, true)

            .setTimestamp(new Date())
            .setFooter('POAP Bot', BotConfig.poapLogoURL);
    }

    private static getEventStatus(event: BotEvent, timeToEvent: TimeToEvent){
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
