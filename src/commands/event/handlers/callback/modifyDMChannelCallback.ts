import {EventState, EventABMStep, EventABM} from "../../../../interfaces/command/event/eventABM.interface";
import {DMChannelAbstractCallback} from "./DMChannelAbstractCallback";
import {SetupChannelStepHandler} from "../steps/setupChannelStepHandler";
import {SetupDateStartStepHandler} from "../steps/setupDateStartStepHandler";
import {SetupDateEndStepHandler} from "../steps/setupDateEndStepHandler";
import {SetupResponseStepHandler} from "../steps/setupResponseStepHandler";
import {SetupPassStepHandler} from "../steps/setupPassStepHandler";

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
        ];
    }
}
