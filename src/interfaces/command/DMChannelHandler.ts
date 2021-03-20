import {Message, User} from "discord.js";

export interface DMChannelHandler{
    DMChannelHandler(message: Message, user: User): Promise<Message>;
}