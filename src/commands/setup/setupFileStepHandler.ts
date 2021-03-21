import {SetupState, SetupStep, SetupStepId} from "../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {BotConfig} from "../../config/bot.config";
import {logger} from "../../logger";

export class SetupFileStepHandler implements SetupStep{
    readonly stepId: SetupStepId = 'RESPONSE';

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Response to send privately to members during the event? (${BotConfig.defaultResponseMessage})`);
    }

    async handler(message: Message, setupState: SetupState):Promise<string> {
        if (message.attachments.size <= 0) {
            await setupState.dmChannel.send(`No file attachment found!`);
            return Promise.reject("Invalid file step, no file attached");
        }

        const messageAttachment = message.attachments.first();
        logger.info(`[STEPS] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);
        setupState.event.setFileUrl(messageAttachment.url);
        let total_count = await this.readCsvAttachment(messageAttachment.url, setupState.event.uuid);
        // Report number of codes added
        return `DONE! codes added`;
    }

    private async readCsvAttachment(url, uuid){

    }
}