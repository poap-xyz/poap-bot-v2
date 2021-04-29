import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";
import {logger} from "../../../../logger";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {CodeInput} from "../../../../models/input/codeInput";
import {CodesCsvHelper} from "../../../../_helpers/utils/codesCsvHelper";

export class SetupFileStepHandler extends SetupAbstractHandler{
    constructor() {
        super('FILE');
    }

    async sendInitMessage(EventState: EventState): Promise<Message> {
        return await EventState.dmChannel.send(`Please attach your links.txt file`);
    }

    async handler(message: Message, EventState: EventState): Promise<string> {
        if (message.attachments.size <= 0) {
            await EventState.dmChannel.send(`No file attachment found!`);
            return Promise.reject("Invalid file step, no file attached");
        }

        const messageAttachment = message.attachments.first();
        logger.info(`[FileEventABMStep] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);

        let codes: CodeInput[] = await CodesCsvHelper.readCsvAttachment(messageAttachment.url);
        EventState.event.setCodes(codes);
        EventState.event.setFileUrl(messageAttachment.url);

        return codes.toString();
    }

}
