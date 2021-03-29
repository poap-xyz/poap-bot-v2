export type ScheduleCallback = {
    callback: (...args) => void,
    setTimeOut: NodeJS.Timeout,
    timeOut: number,
    created: Date,
}