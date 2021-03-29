import {Channel, Message} from "discord.js";
import {ChannelManager} from "../../../../_helpers/utils/channelManager";
import {BotConfig} from "../../../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {SetupAbstractHandler} from "./setupAbstractHandler";

export class SetupChannelStepHandler extends SetupAbstractHandler {
    constructor() {
        super('CHANNEL');
    }

    async sendInitMessage(setupState: SetupState): Promise<Message>{
        return await setupState.dmChannel.send(`Which channel should I speak in public? (${setupState.channel || ""}) *Hint: only for start and end event`);
    }

    async handler(message: Message, setupState: SetupState):Promise<string> {
        const messageContent:string = message.content;
        let selectedChannel: Channel;

        selectedChannel = ChannelManager.getChannelFromGuild(setupState.guild, messageContent);
        //Check for default channel
        if (messageContent === BotConfig.defaultOptionMessage)
            selectedChannel = setupState.channel;

        if (!selectedChannel) {
            const channels = ChannelManager.getChannelsString(setupState.guild)
            await setupState.dmChannel.send(`I can't find a channel named ${messageContent}. Try again -> ${channels}`);
            return Promise.reject(`Invalid channel, message content: ${messageContent}`);
        }

        setupState.event = setupState.event.setChannel(selectedChannel.id);
        return selectedChannel.toString();
    };

}
