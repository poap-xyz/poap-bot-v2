import {Channel, Message} from "discord.js";
import {ChannelManager} from "../../_helpers/utils/channelManager";
import {BotConfig} from "../../config/bot.config";
import {SetupState} from "./setup.command";

export class SetupChannelStepHandler{
    public static channelStepHandler(messageContent: string, setupState: SetupState): Promise<Message>{
        let selectedChannel: Channel;

        selectedChannel = ChannelManager.getChannelFromGuild(setupState.guild, messageContent);
        //Check for default channel
        if (messageContent === BotConfig.defaultOptionMessage)
            selectedChannel = setupState.channel;

        if (!selectedChannel) {
            const channels = ChannelManager.getChannelsString(setupState.guild)
            return setupState.dmChannel.send(`I can't find a channel named ${messageContent}. Try again -> ${channels}`);
        }

        setupState.event = setupState.event.setChannel(selectedChannel.id);
        setupState.step = "START";
        return setupState.dmChannel.send(`Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm`);
    }
}
