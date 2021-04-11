import {BotEvent} from "../../models/core/botEvent";
import {inject, injectable} from "inversify";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import {
    EventSchedule,
    EventScheduleService,
    TimeToEvent
} from "../../interfaces/services/schedule/eventScheduleService";
import {ScheduleCallback} from "../../interfaces/callback/schedeuleCallback";
import {ScheduleService} from "../../interfaces/services/schedule/scheduleService";
import {logger} from "../../logger";
import {Guild, GuildChannel, TextChannel} from "discord.js";
import {GuildService} from "../../interfaces/services/discord/guildService";
import {ChannelService} from "../../interfaces/services/discord/channelService";

@injectable()
export class EventScheduleServiceImpl implements EventScheduleService{
    private eventService: EventService;
    private scheduleService: ScheduleService;
    private scheduledEvents: Map<number, EventSchedule>;
    private guildService: GuildService;
    private channelService: ChannelService;

    constructor(@inject(TYPES.EventService) eventService: EventService, @inject(TYPES.ScheduleService) scheduleService: ScheduleService,
                @inject(TYPES.GuildService) guildService: GuildService, @inject(TYPES.ChannelService) channelService: ChannelService) {
        this.eventService = eventService;
        this.guildService = guildService;
        this.channelService = channelService;
        this.scheduleService = scheduleService;
        this.scheduledEvents = new Map<number, EventSchedule>();
    }

    public cancelEvent(event: BotEvent): boolean {
        const eventSchedule = this.getEventScheduled(event);
        if(!eventSchedule)
            return false;

        this.scheduleService.cancelCallback(eventSchedule.start);
        this.scheduleService.cancelCallback(eventSchedule.end);
        return true;
    }

    public getTimeToEvent(event: BotEvent): TimeToEvent{
        const eventSchedule = this.getEventScheduled(event);
        if(!eventSchedule)
            return undefined;

        return {startSecs: this.scheduleService.getSecondsToExecution(eventSchedule.start), endSecs: this.scheduleService.getSecondsToExecution(eventSchedule.end)};
    }

    public isEventScheduled(event: BotEvent): boolean {
        return this.scheduledEvents.has(event.id);
    }

    public getEventScheduled(event: BotEvent): EventSchedule{
        if(!this.isEventScheduled(event))
            return undefined;

        return this.scheduledEvents.get(event.id);
    }

    public addEventSchedule(scheduledEvent: EventSchedule): EventSchedule{
        const event = scheduledEvent.event;
        if(this.isEventScheduled(event))
            return undefined;

        this.scheduledEvents.set(event.id, scheduledEvent);
        return scheduledEvent;
    }

    public async scheduleEvent(event: BotEvent): Promise<EventSchedule> {
        const startMessage = "The POAP distribution event is now active. *DM me to get your POAP*";
        const endMessage = "The POAP distribution event has ended.";
        let eventSchedule = {
            event: event,
            start: await this.scheduleEventCallback(event, startMessage, event.start_date),
            end: await this.scheduleEventCallback(event, endMessage, event.end_date)
        };
        eventSchedule = this.addEventSchedule(eventSchedule);
        return eventSchedule;
    }

    private async scheduleEventCallback(event: BotEvent, message: string, executeDate: Date): Promise<ScheduleCallback> {
        const guild: Guild = await this.guildService.getGuildById(event.server);
        const channel: GuildChannel = guild && this.channelService.getChannelFromGuild(guild, event.channel);
        if (!(guild && channel && channel instanceof TextChannel))
            return undefined;

        const textChannel: TextChannel = <TextChannel>channel;
        return this.scheduleService.scheduleCallback(async () => {
            await textChannel.send(message)
        }, executeDate);
    }

    async schedulePendingEvents(): Promise<EventSchedule[]> {
        let eventSchedules: EventSchedule[] = [];
        try {
            let events: BotEvent[] = await this.eventService.getFutureActiveEvents();
            if (!(events && events.length)){
                logger.info(`[EventScheduleService] No future active events`);
                return undefined;
            }

            logger.info(`[EventScheduleService] Active events: ${events.length}`);
            for (let i = 0; i < events.length; i++) {
                eventSchedules.push(await this.scheduleEvent(events[i]));
            }
        } catch (e){
            logger.error(`[EventScheduleService] Error while getting future event, error: ${e}`);
        }
        return eventSchedules;
    }

}
