import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {logger} from "../../../../logger";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {CodeInput} from "../../../../models/input/codeInput";
import {CodesCsvHelper} from "../../../../_helpers/utils/codesCsvHelper";

export class SetupFileStepHandler extends SetupAbstractHandler{
    constructor() {
        super('FILE');
    }

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Please attach your links.txt file`);
    }

    async handler(message: Message, setupState: SetupState): Promise<string> {
        if (message.attachments.size <= 0) {
            await setupState.dmChannel.send(`No file attachment found!`);
            return Promise.reject("Invalid file step, no file attached");
        }

        const messageAttachment = message.attachments.first();
        logger.info(`[FileSetupStep] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);

        let codes: CodeInput[] = await CodesCsvHelper.readCsvAttachment(messageAttachment.url);
        setupState.event.setCodes(codes);
        setupState.event.setFileUrl(messageAttachment.url);

        return codes.toString();
    }

}
