import {BotConfig} from "../../config/bot.config";
import {SetupState} from "./setup.command";

export class SetupResponseStepHandler{
    public static responseStepHandler(messageContent: string, setupState: SetupState){
        let responseMessage: string;

        if (messageContent === BotConfig.defaultOptionMessage)
            responseMessage = BotConfig.defaultResponseMessage;

        if(!messageContent || !messageContent.length)
            return setupState.dmChannel.send(`Please provide a response or send '-' for default `)

        setupState.event.setResponseMessage(responseMessage);
        setupState.step = 'PASS';
        return setupState.dmChannel.send(`Choose secret 🔒  pass (like a word, a hash from youtube or a complete link)
         This pass is for your users.`);
    }
}
