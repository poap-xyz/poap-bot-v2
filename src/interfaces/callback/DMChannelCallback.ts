import {Message, User} from "discord.js";
import {EventState} from "../command/event/eventABM.interface";

export interface DMChannelCallback{
    sendInitMessage(eventState: EventState): Promise<Message>
    DMCallback(message: Message, user: User): Promise<Message>;
}