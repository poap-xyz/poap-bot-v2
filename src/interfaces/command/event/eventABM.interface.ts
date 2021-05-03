import {Channel, DMChannel, Guild, Message, Snowflake, User} from "discord.js";
import {BotEventInputBuilder} from "../../../models/builders/eventInputBuilder";
import {TYPES} from "../../../config/types";
import {EventService} from "../../services/core/eventService";
import {ChannelService} from "../../services/discord/channelService";
import {EventScheduleService} from "../../services/schedule/eventScheduleService";

export type EventABMStepId = 'NONE' | 'CHANNEL' | 'START' | 'END' | 'START_MSG' |
    'END_MSG' | 'RESPONSE' |'REACTION' | 'PASS' | 'FILE';

export interface EventABMStep {
    readonly stepId: EventABMStepId;
    sendInitMessage(EventState: EventState): Promise<Message>;
    sendErrorMessage(EventState: EventState): Promise<Message>;
    handler(message: Message, EventState: EventState): Promise<string>;
}

export type EventState = {
    step: number,
    user: User,
    guild: Guild,
    channel: Channel,
    dmChannel: DMChannel,
    event: BotEventInputBuilder,
}

export interface EventABM{
    eventService: EventService;
    channelService: ChannelService;
    eventScheduleService: EventScheduleService;
    getEventStateByUser(userId: string | Snowflake): EventState;
    clearEventState(user: EventState["user"]): Promise<void>;
    saveEvent(eventState: EventState): Promise<Message>;
}