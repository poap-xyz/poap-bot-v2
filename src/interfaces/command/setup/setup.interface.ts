import {Channel, DMChannel, Guild, Message, User} from "discord.js";
import {EventBuilder} from "../../../models/builders/eventBuilder";

export type SetupStepId = 'NONE' | 'CHANNEL' | 'START' | 'END' | 'START_MSG' |
    'END_MSG' | 'RESPONSE' |'REACTION' | 'PASS' | 'FILE';

export interface SetupStep {
    stepId: SetupStepId;
    sendInitMessage(setupState: SetupState): Promise<Message>;
    handler(message:string, setupState: SetupState): Promise<string>;
}

export type SetupState = {
    step: number,
    user: User,
    guild: Guild,
    channel: Channel,
    dmChannel: DMChannel,
    event: EventBuilder,
    expire: number,
}