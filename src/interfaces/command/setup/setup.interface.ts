import {Channel, DMChannel, Guild, Message, User} from "discord.js";
import {EventInputBuilder} from "../../../models/builders/eventInputBuilder";

export type SetupStepId = 'NONE' | 'CHANNEL' | 'START' | 'END' | 'START_MSG' |
    'END_MSG' | 'RESPONSE' |'REACTION' | 'PASS' | 'FILE';

export interface SetupStep {
    readonly stepId: SetupStepId;
    sendInitMessage(setupState: SetupState): Promise<Message>;
    sendErrorMessage(setupState: SetupState): Promise<Message>;
    handler(message: Message, setupState: SetupState): Promise<string>;
}

export type SetupState = {
    step: number,
    user: User,
    guild: Guild,
    channel: Channel,
    dmChannel: DMChannel,
    event: EventInputBuilder,
}