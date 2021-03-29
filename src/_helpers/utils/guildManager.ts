import {Channel, Client, Guild} from "discord.js";
import {inject} from "inversify";
import {TYPES} from "../../config/types";

export class GuildManager{
    private readonly client: Client;
    constructor(@inject(TYPES.Client) client: Client) {
        this.client = client;
    }

    public getGuild(guildName: string): Guild{
        if(!guildName)
            return undefined;

        const stripGuildName = guildName.trim().toLowerCase();

        //TODO research this
        return this.client.guilds.cache.find((guild) => guild.name === stripGuildName);
    }
}