import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {BotEventInputBuilder} from "../../models/builders/eventInputBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {EventABM, EventState} from "../../interfaces/command/event/eventABM.interface";
import {SetupDMChannelCallback} from "./handlers/setupDMChannelCallback";
import {BotEventInput} from "../../models/input/botEventInput";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {BotEvent} from "../../models/core/botEvent";
import {CommandOptions} from "../../interfaces/command/commandOptions";

const { lazyInject } = getDecorators(container);

export default abstract class EventABMAbstractCommand extends Command implements EventABM{
    private static setupUsers: Map<Snowflake, EventState>;
    protected readonly setupDMChannelHandler: SetupDMChannelCallback;

    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.EventScheduleService) readonly eventScheduleService: EventScheduleService;
    protected constructor(name: string, commandOptions: CommandOptions) {
        super(name, commandOptions);
        this.setupDMChannelHandler = new SetupDMChannelCallback(this);

        /* Initialize static map */
        if(!EventABMAbstractCommand.setupUsers)
            EventABMAbstractCommand.setupUsers = new Map();
    }

    protected async execute(commandContext: CommandContext): Promise<Message | Message[]> {
        const message = commandContext.message;
        const user = message.member.user;
        const guild = message.guild;

        if(this.userHasStartedSetup(user)){
            return await message.reply("You already have another command initialized.");
        }

        return await this.initializeSetup(user, guild, commandContext);
    }

    private async initializeSetup(user: User, guild: Guild, commandContext: CommandContext) {
        const defaultSetup = this.getInitialEventState(user, guild, commandContext);

        if(!this.userHasStartedSetup(user)) {
            const initializedSetup = await this.initializeDMChannel(defaultSetup);
            EventABMAbstractCommand.setupUsers.set(user.id, initializedSetup);
            logger.info(`Initialized Setup for user ${initializedSetup.user} and guild ${guild}`);
        }

        return await commandContext.message.reply("Command initialized please continue configuration in DM");
    }

    protected abstract getInitialEventState(user: User, guild: Guild, commandContext: CommandContext): EventState;

    private async initializeDMChannel(defaultSetup: EventState): Promise<EventState>{
        const {user} = defaultSetup;
        const dmChannel = await this.channelService.createDMChannelWithHandler(user, this.setupDMChannelHandler);
        const initializedSetup: EventState = {...defaultSetup, dmChannel: dmChannel};

        await this.sendInitialDM(initializedSetup);
        return initializedSetup;
    }

    protected abstract sendInitialDM(eventState: EventState);

    public userHasStartedSetup(user: User): boolean {
        return EventABMAbstractCommand.setupUsers.has(user.id);
    }

    public getEventStateByUser(user: Snowflake): EventState{
        if(!EventABMAbstractCommand.setupUsers.has(user))
            return undefined;
        return EventABMAbstractCommand.setupUsers.get(user);
    }

    public async clearEventState(user: User): Promise<void>{
        const EventState = this.getEventStateByUser(user.id);
        if(!EventState)
            return;

        try {
            await this.channelService.deleteUserDMChannel(user, "Setup finished");
            EventABMAbstractCommand.setupUsers.delete(user.id);
        }catch (e){
            logger.error(`ClearEventState error: ${e}`);
        }
    }

    public abstract saveEvent(eventState: EventState): Promise<Message>;
}
