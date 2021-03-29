import {Message, User} from "discord.js";

export interface DMChannelCallback {
    DMCallback(message: Message, user: User): Promise<Message>;
}