import {GuildService} from "../../interfaces/services/discord/guildService";
import {Client, Guild} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";

@injectable()
export class GuildServiceImpl implements GuildService{
    private readonly client: Client;

    constructor(@inject(TYPES.Client) client: Client) {
        this.client = client;
    }

    public getGuildById(guildId: string) {
        if(!guildId)
            return undefined;

        //TODO research this
        return this.client.guilds.cache.find((guild) => guild.id === guildId);
    }

    public getGuildByName(guildName: string) {
        if(!guildName)
            return undefined;

        const stripGuildName = guildName.trim().toLowerCase();

        //TODO research this
        return this.client.guilds.cache.find((guild) => guild.name === stripGuildName);
    }
}