import {Channel, Message} from "discord.js";
import {BotConfig} from "../../../../config/bot.config";
import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {ChannelService} from "../../../../interfaces/services/discord/channelService";

export class SetupChannelStepHandler extends SetupAbstractHandler {
    private readonly channelService: ChannelService;
    constructor(channelService: ChannelService) {
        super('CHANNEL');
        this.channelService = channelService;
    }

    async sendInitMessage(EventState: EventState): Promise<Message>{
        return await EventState.dmChannel.send(`Which channel should I speak in public? (${EventState.channel || ""}) *Hint: only for start and end event`);
    }

    async handler(message: Message, EventState: EventState):Promise<string> {
        const messageContent:string = message.content;
        let selectedChannel: Channel;

        selectedChannel = this.channelService.getChannelFromGuild(EventState.guild, messageContent);
        //Check for default channel
        if (messageContent === BotConfig.defaultOptionMessage)
            selectedChannel = EventState.channel;

        if (!selectedChannel) {
            const channels = this.channelService.getChannelsString(EventState.guild);
            await EventState.dmChannel.send(`I can't find a channel named ${messageContent}. Try again -> ${channels}`);
            return Promise.reject(`Invalid channel, message content: ${messageContent}`);
        }

        EventState.event = EventState.event.setChannel(selectedChannel.id);
        return selectedChannel.toString();
    };

}
