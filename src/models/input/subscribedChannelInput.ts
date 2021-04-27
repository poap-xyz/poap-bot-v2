import {Snowflake} from "discord.js";

export interface SubscribedChannelInput{
    server: string | Snowflake,
    channel: string | Snowflake,
    xDai: boolean,
    mainnet: boolean,
}