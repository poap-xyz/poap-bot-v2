import {ScheduleCallback} from "../../schedeuleCallback";
import {Event} from "../../../models/event";

export type EventSchedule = {
    start: ScheduleCallback,
    end: ScheduleCallback,
}

export interface EventScheduleService{
    schedulePendingEvents(): Promise<EventSchedule[]>
    scheduleEvent(event: Event): EventSchedule;
    cancelEvent(event: Event): boolean;
    isEventScheduled(event: Event): boolean;
    getEventScheduled(event: Event): EventSchedule;
}