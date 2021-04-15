import {Channel} from "discord.js";

export interface MintChannelService{
    initSubscribers();
    addChannelToMint(channel: Channel);
}