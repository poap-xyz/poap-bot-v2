import {inject, injectable} from "inversify";
import {CommandLoader} from "../loaders/commandLoader";
import {TYPES} from "../../config/types";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";

@injectable()
export class InitHandler {
    private readonly eventScheduleService: EventScheduleService;

    constructor(@inject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService) {
        this.eventScheduleService = eventScheduleService;
    }
}