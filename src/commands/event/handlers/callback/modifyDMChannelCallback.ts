import {Message, User} from "discord.js";
import {EventState, EventABMStep, EventABM} from "../../../../interfaces/command/event/eventABM.interface";
import {logger} from "../../../../logger";
import Setup from "../../setup.command";
import {EventService} from "../../../../interfaces/services/core/eventService";
import {DMChannelAbstractCallback} from "./DMChannelAbstractCallback";
import {SetupChannelStepHandler} from "../steps/setupChannelStepHandler";
import {SetupDateStartStepHandler} from "../steps/setupDateStartStepHandler";
import {SetupDateEndStepHandler} from "../steps/setupDateEndStepHandler";
import {SetupResponseStepHandler} from "../steps/setupResponseStepHandler";
import {SetupPassStepHandler} from "../steps/setupPassStepHandler";
import {SetupFileStepHandler} from "../steps/setupFileStepHandler";
import {ChannelService} from "../../../../interfaces/services/discord/channelService";

export class ModifyDMChannelCallback extends DMChannelAbstractCallback{

    constructor(eventABM: EventABM) {
        super(eventABM);
    }

    protected initializeEventABMStepsList(): EventABMStep[]{
        return [
            new SetupChannelStepHandler(this.channelService),
            new SetupDateStartStepHandler(),
            new SetupDateEndStepHandler(),
            new SetupResponseStepHandler(),
            new SetupPassStepHandler(this.eventService),
        ];
    }
}
