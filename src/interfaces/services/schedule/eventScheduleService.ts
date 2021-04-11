import {ScheduleCallback} from "../../callback/schedeuleCallback";
import {BotEvent} from "../../../models/core/event";

export type EventSchedule = {
    event: BotEvent,
    start: ScheduleCallback,
    end: ScheduleCallback,
}

export type TimeToEvent = {
    startSecs: number,
    endSecs: number,
}

export interface EventScheduleService{
    schedulePendingEvents(): Promise<EventSchedule[]>
    scheduleEvent(event: BotEvent): Promise<EventSchedule>;
    cancelEvent(event: BotEvent): boolean;
    isEventScheduled(event: BotEvent): boolean;
    getEventScheduled(event: BotEvent): EventSchedule;
    getTimeToEvent(event: BotEvent): TimeToEvent;
}