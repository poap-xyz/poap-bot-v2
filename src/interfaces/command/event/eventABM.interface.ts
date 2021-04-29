import {Channel, DMChannel, Guild, Message, User} from "discord.js";
import {EventInputBuilder} from "../../../models/builders/eventInputBuilder";

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
    event: EventInputBuilder,
}