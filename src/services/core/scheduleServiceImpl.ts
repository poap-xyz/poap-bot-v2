import {ScheduleService} from "../../interfaces/services/core/scheduleService";
import {ScheduleCallback} from "../../interfaces/schedeuleCallback";
import {isNumber} from "util";

export class ScheduleServiceImpl implements ScheduleService{
    constructor() {
    }

    public scheduleCallback(callback: (...args) => void, timeOutSecs: Date | number): ScheduleCallback {
        if(typeof timeOutSecs === 'number')
            return ScheduleServiceImpl.scheduleCallbackByTime(callback, timeOutSecs);

        if(Object.prototype.toString.call(timeOutSecs) === '[object Date]'){
            if ("getTime" in timeOutSecs) {
                const now = new Date();
                const timeOutSecsDate = (timeOutSecs.getTime() - now.getTime()) / 1000;
                return ScheduleServiceImpl.scheduleCallbackByTime(callback, timeOutSecsDate);
            }
        }

        return undefined;
    }

    private static scheduleCallbackByTime(callback: (...args) => void, timeOutSecs: number): ScheduleCallback {
        return {created: new Date(), timeOut: timeOutSecs, callback: callback, setTimeOut: setTimeout(callback, timeOutSecs * 1000)};
    }

    public cancelCallback(scheduleCallback: ScheduleCallback): void {
        clearTimeout(scheduleCallback.setTimeOut);
        scheduleCallback.timeOut = 0;
    }

    public rescheduleCallback(scheduleCallback: ScheduleCallback, newTimeOutSecs: number | Date) {
        this.cancelCallback(scheduleCallback);
        return this.scheduleCallback(scheduleCallback.callback, newTimeOutSecs);
    }
}