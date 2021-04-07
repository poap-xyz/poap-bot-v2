import {GuildService} from "../../interfaces/services/discord/guildService";
import {Client, Guild, Snowflake} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";

@injectable()
export class GuildServiceImpl implements GuildService{
    private readonly client: Client;

    constructor(@inject(TYPES.Client) client: Client) {
        this.client = client;
    }

    public async getGuildById(guildId: string | Snowflake) {
        if (!guildId)
            return undefined;
        return this.client.guilds.cache.find((guild) => guild.id === guildId) || await this.client.guilds.fetch(guildId);
    }

    public getGuildByName(guildName: string) {
        if(!guildName)
            return undefined;

        const stripGuildName = guildName.trim().toLowerCase();

        return this.client.guilds.cache.find((guild) => guild.name === stripGuildName);
    }

}