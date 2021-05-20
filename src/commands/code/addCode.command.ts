import {Command} from "../command";
import {TYPES} from "../../config/types";
import {EventService} from "../../interfaces/services/core/eventService";
import {CodeService} from "../../interfaces/services/core/codeService";
import {GuildService} from "../../interfaces/services/discord/guildService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {CommandContext} from "../commandContext";
import {Message, Snowflake} from "discord.js";
import {logger} from "../../logger";
import {CodeInput} from "../../models/input/codeInput";
import {CodesCsvHelper} from "../../_helpers/utils/codesCsvHelper";
import {BotEvent} from "../../models/core/botEvent";
import {BotEventBuilder} from "../../models/builders/botEventBuilder";
const { lazyInject } = getDecorators(container);

export default class AddCodeCommand extends Command {
    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.CodeService) readonly codeService: CodeService;
    @lazyInject(TYPES.GuildService) readonly guildService: GuildService;
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.EventScheduleService) readonly eventScheduleService: EventScheduleService;

    constructor() {
        super("addcodes",
            {aliases: ['addcode', 'replacecodes', 'replacecode'],
                commandType: {DMCommand: true, GuildCommand: false},
                botPermissions: [],
                memberPermissions: []})
    }

    protected async execute(commandContext: CommandContext): Promise<Message | Message[]> {
        const message = commandContext.message;
        const event_id = await AddCodeCommand.getEventIdFromArgs(commandContext);
        const codes = await AddCodeCommand.getCodesFromCSV(message);

        if(!event_id){
            return await message.reply(`Invalid arguments, please specify the event id to add codes.\n E.g: !addcodes 3`);
        }

        if(!codes)
            return await message.reply(`No codes file attachment found!`);

        try{
            const eventBuilder = await this.getEventBuilderAndValidate(event_id, message.author.id);
            if(!eventBuilder)
                return await message.reply(`This event cannot be edited because user credentials are invalid or it is not longer active`);

            const replaceCodes = AddCodeCommand.shouldReplaceExistingCodes(commandContext);

            if(replaceCodes){
                console.log("SIII");
                await this.codeService.deleteCodesByEvent(event_id);
            }


            /* Update codes for the event */
            const event = eventBuilder.setCodes(codes).build();
            await this.eventService.updateEvent(event);
        }catch (e){
            logger.error(`[AddCodesCommand] Error modifying event, message: ${e}`);
            return await message.reply(`This event cannot be edited because user credentials are invalid or it is not longer active`);
        }

        await message.react("🙌");
    }

    private static async getCodesFromCSV(message: Message): Promise<CodeInput[]>{
        if (message.attachments.size <= 0) {
            return undefined;
        }
        try{
            const messageAttachment = message.attachments.first();
            logger.info(`[AddCodeCommand] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);
            return await CodesCsvHelper.readCsvAttachment(messageAttachment.url);
        }catch (e){
            logger.error(`[AddCodesCommand] Error parsing csv file, message: ${e}`);
        }
        return undefined;
    }

    private static async getEventIdFromArgs(commandContext: CommandContext){
        if(commandContext.args.length > 0 && Number.parseInt(commandContext.args[0].trim())){
            return commandContext.args[0];
        }

        return undefined;
    }

    private async getEventBuilderAndValidate(eventId: string | number, usernameId: string): Promise<BotEventBuilder>{
        const event = await this.eventService.getEventById(eventId);
        if(!AddCodeCommand.validateEvent(event, usernameId))
            return undefined;

        return BotEventBuilder.builderFromBotEvent(event);
    }

    private static validateEvent(event: BotEvent, usernameId: string | Snowflake): boolean{
        return (event && event.is_active && event.created_by === usernameId);
    }

    private static shouldReplaceExistingCodes(commandContext: CommandContext): boolean{
        return (commandContext.parsedCommandName.indexOf("replace") !== -1);
    }
}
