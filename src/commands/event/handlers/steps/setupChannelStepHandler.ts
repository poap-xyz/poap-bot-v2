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

    async sendInitMessage(eventState: EventState): Promise<Message>{
        return await eventState.dmChannel.send(`Which channel should I speak in public? (${eventState.channel || ""}) *Hint: only for start and end event`);
    }

    async handler(message: Message, eventState: EventState):Promise<string> {
        const messageContent:string = message.content.trim();
        let selectedChannel: Channel;
        let selectedChannelId: string;

        //Check for default channel
        if (messageContent === BotConfig.defaultOptionMessage) {
            selectedChannelId = eventState.event.channel ? eventState.event.channel : eventState.channel.id;
        }else{
            selectedChannel = this.channelService.getChannelFromGuild(eventState.guild, messageContent);
            if(selectedChannel)
                selectedChannelId = selectedChannel.id;
        }

        if (!selectedChannelId) {
            const channels = this.channelService.getChannelsString(eventState.guild);
            await eventState.dmChannel.send(`I can't find a channel named ${messageContent}. Try again -> ${channels}`);
            return Promise.reject(`Invalid channel, message content: ${messageContent}`);
        }

        eventState.event = eventState.event.setChannel(selectedChannelId);
        return selectedChannel.toString();
    };

}
