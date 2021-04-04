import {ScheduleService} from "../../interfaces/services/schedule/scheduleService";
import {ScheduleCallback} from "../../interfaces/callback/schedeuleCallback";
import {injectable} from "inversify";
import {logger} from "../../logger";

@injectable()
export class ScheduleServiceImpl implements ScheduleService{
    constructor() {
    }

    public scheduleCallback(callback: (...args) => void, timeOutSecs: Date | number): ScheduleCallback {
        if(typeof timeOutSecs === 'number')
            return ScheduleServiceImpl.scheduleCallbackByTime(callback, timeOutSecs);
        console.log("si")
        if(Object.prototype.toString.call(timeOutSecs) === '[object Date]'){
            if ("getTime" in timeOutSecs) {
                const now = new Date();
                const timeOutSecsDate = (timeOutSecs.getTime() - now.getTime()) / 1000;
                return ScheduleServiceImpl.scheduleCallbackByTime(callback, timeOutSecsDate);
            }
        }

        return undefined;
    }

    public getSecondsToExecution(scheduleCallback: ScheduleCallback): number{
        if(!scheduleCallback)
            return undefined;

        const now = new Date();
        const secToExecution = scheduleCallback.timeOut - ((now.getTime() - scheduleCallback.created.getTime()) / 1000);
        return secToExecution > 0? secToExecution : 0;
    }

    private static scheduleCallbackByTime(callback: (...args) => void, timeOutSecs: number): ScheduleCallback {
        logger.debug(`Scheduling callback for timeout in ${timeOutSecs} seconds`);
        if(timeOutSecs < 0)
            timeOutSecs = 0;

        return {created: new Date(), timeOut: timeOutSecs, callback: callback, setTimeOut: setTimeout(callback, timeOutSecs * 1000)};
    }

    public cancelCallback(scheduleCallback: ScheduleCallback): void {
        if(!(scheduleCallback && scheduleCallback.setTimeOut))
            return;

        clearTimeout(scheduleCallback.setTimeOut);
        scheduleCallback.timeOut = 0;
    }

    public rescheduleCallback(scheduleCallback: ScheduleCallback, newTimeOutSecs: number | Date) {
        this.cancelCallback(scheduleCallback);
        return this.scheduleCallback(scheduleCallback.callback, newTimeOutSecs);
    }
}