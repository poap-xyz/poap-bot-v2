import {ScheduleCallback} from "../../callback/schedeuleCallback";
import {Event} from "../../../models/event";
import {TimeToEvent} from "./eventScheduleService";

export interface ScheduleService{
    scheduleCallback(callback: (...args) => void, timeOutSecs: number | Date): ScheduleCallback;
    getSecondsToExecution(scheduleCallback: ScheduleCallback): number;
    rescheduleCallback(scheduleCallback: ScheduleCallback, newTimeOutSecs: number | Date): ScheduleCallback;
    cancelCallback(scheduleCallback: ScheduleCallback): void;
}