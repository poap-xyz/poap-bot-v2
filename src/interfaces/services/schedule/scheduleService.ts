import {ScheduleCallback} from "../../callback/schedeuleCallback";

export interface ScheduleService{
    scheduleCallback(callback: (...args) => void, timeOutSecs: number | Date): ScheduleCallback;
    rescheduleCallback(scheduleCallback: ScheduleCallback, newTimeOutSecs: number | Date): ScheduleCallback;
    cancelCallback(scheduleCallback: ScheduleCallback): void;
}