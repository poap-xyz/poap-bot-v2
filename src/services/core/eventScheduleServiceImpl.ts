import {Event} from "../../models/event";
import {inject, injectable} from "inversify";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import {EventSchedule, EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {ScheduleCallback} from "../../interfaces/callback/schedeuleCallback";
import {ScheduleService} from "../../interfaces/services/schedule/scheduleService";
import {logger} from "../../logger";
import {ChannelManager} from "../../_helpers/utils/channelManager";
import {Guild, GuildChannel, TextChannel} from "discord.js";
import {GuildService} from "../../interfaces/services/discord/guildService";

@injectable()
export class EventScheduleServiceImpl implements EventScheduleService{
    private eventService: EventService;
    private scheduleService: ScheduleService;
    private scheduledEvents: Map<number, EventSchedule>;
    private guildService: GuildService;

    constructor(@inject(TYPES.EventService) eventService: EventService, @inject(TYPES.ScheduleService) scheduleService: ScheduleService,
                @inject(TYPES.GuildService) guildManager: GuildService) {
        this.eventService = eventService;
        this.scheduleService = scheduleService;
        this.scheduledEvents = new Map<number, EventSchedule>();
        this.guildService = guildManager;
    }

    public cancelEvent(event: Event): boolean {
        const eventSchedule = this.getEventScheduled(event);
        if(!eventSchedule)
            return false;

        this.scheduleService.cancelCallback(eventSchedule.start);
        this.scheduleService.cancelCallback(eventSchedule.end);
        return true;
    }

    public isEventScheduled(event: Event): boolean {
        return this.scheduledEvents.has(event.id);
    }

    public getEventScheduled(event: Event): EventSchedule{
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

    public scheduleEvent(event: Event): EventSchedule {
        const startMessage = "The POAP distribution event is now active. *DM me to get your POAP*";
        const endMessage = "The POAP distribution event has ended.";
        let eventSchedule = {
            event: event,
            start: this.scheduleEventCallback(event, startMessage, event.start_date),
            end: this.scheduleEventCallback(event, endMessage, event.end_date)
        };
        eventSchedule = this.addEventSchedule(eventSchedule);
        return eventSchedule;
    }

    private scheduleEventCallback(event: Event, message: string, executeDate: Date): ScheduleCallback{
        const guild: Guild = this.guildService.getGuildByName(event.server);
        const channel: GuildChannel = guild && ChannelManager.getChannelFromGuild(guild, event.channel);

        if(!(guild && channel && channel instanceof TextChannel))
            return undefined;

        const textChannel: TextChannel = <TextChannel> channel;
        return this.scheduleService.scheduleCallback(async () => {
            await textChannel.send(message)
        }, executeDate);
    }

    async schedulePendingEvents(): Promise<EventSchedule[]> {
        let eventSchedules: EventSchedule[] = [];
        try {
            let events: Event[] = await this.eventService.getFutureActiveEvents();
            if (!(events && events.length)){
                logger.info(`[PG] No future active events`);
                return undefined;
            }

            logger.info(`[PG] Active events: ${events.length}`);
            for (let i = 0; i < events.length; i++) {
                eventSchedules.push(this.scheduleEvent(events[i]));
            }
        } catch (e){
            logger.error(`[PG] Error while getting future event, error: ${e}`);
        }
        return eventSchedules;
    }

}