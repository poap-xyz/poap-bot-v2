import {Command} from "../../command";
import {TYPES} from "../../../config/types";
import {EventService} from "../../../interfaces/services/core/eventService";
import {CodeService} from "../../../interfaces/services/core/codeService";
import {ChannelService} from "../../../interfaces/services/discord/channelService";
import {Message} from "discord.js";
import {CommandContext} from "../../commandContext";
import {BotEvent} from "../../../models/core/botEvent";
import {BotConfig} from "../../../config/bot.config";
import getDecorators from "inversify-inject-decorators";
import container from "../../../config/inversify.config";
import CheckCodeCommand from "../checkCode.command";
import pgPromise from "pg-promise";
import {logger} from "../../../logger";
const { lazyInject } = getDecorators(container);
import dbLegacy from "./dbLegacy";

export default class CheckCodeLegacyCommand extends Command{
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    private readonly db;

    constructor() {
        /* This method call is expensive so it must be last in the execution priority */
        super("code",
            {aliases: [],
                commandType: {DMCommand: true, GuildCommand: true},
                botPermissions: [],
                memberPermissions: []},
            6);
        try{
            this.db = pgPromise()({
                host: process.env.DB_HOST_V1 || "localhost",
                user: process.env.DB_USER_V1 || "postgres",
                password: process.env.DB_PASSWORD_V1 || "postgres",
                database: process.env.DB_DATABASE_V1 || "",
            });
        }catch (e){
            logger.error(`[CheckCodeLegacy] Cant connect to legacy DB, error: ${e}`);
        }
    }

    public async isCommandCalledByMessage(message: Message): Promise<boolean>{
        if(!this.db)
            return false;

        const event = await dbLegacy.getEventFromPass(this.db, message.content);
        /* This method is called last so if no event we react */
        if(!event){
            await message.react("❌");
        }

        return this.channelService.getMessageChannel(message) === "DM_COMMAND" && !!event;
    }

    protected async execute(commandContext: CommandContext): Promise<Message>{
        const event = await dbLegacy.getActiveEventFromPass(this.db, commandContext.message.content);
        if(!event){
            return await commandContext.message.reply("Sorry the event is no longer available!");
        }

        const claimCode = await dbLegacy.checkCodeForEventUsername(this.db, event.id, commandContext.message.author.id);
        if(claimCode){
            const response = CheckCodeCommand.setClaimInResponseMessage(event, claimCode);
            return await commandContext.message.reply(response);
        }

        await commandContext.message.react("🤔");
        return await commandContext.message.reply("Sorry there are no more POAPs available for this event!");
    }

}
