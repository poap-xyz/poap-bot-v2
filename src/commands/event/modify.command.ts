import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {EventInputBuilder} from "../../models/builders/eventInputBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {EventState} from "../../interfaces/command/event/eventABM.interface";
import {SetupDMChannelCallback} from "./handlers/setupDMChannelCallback";
import {BotEventInput} from "../../models/input/botEventInput";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {BotEvent} from "../../models/core/botEvent";

const { lazyInject } = getDecorators(container);

export default class ModifyCommand extends Command{
    private setupUsers: Map<Snowflake, EventState>;
    private readonly setupDMChannelHandler: SetupDMChannelCallback;

    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.EventScheduleService) readonly eventScheduleService: EventScheduleService;
    constructor() {
        super("modify", {
                                        aliases: [],
                                        commandType: {DMCommand: false, GuildCommand: true},
                                        botPermissions: [],
                                        memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
        this.setupUsers = new Map();
        this.setupDMChannelHandler = new SetupDMChannelCallback(this);
    }

    protected async execute(commandContext: CommandContext): Promise<Message | Message[]> {
        const message = commandContext.message;
        const user = message.member.user;
        const guild = message.guild;

        if(this.userHasStartedSetup(user)){
            return await message.reply("You already have another setup initialized.");
        }

        return await this.initializeSetup(user, guild, message);
    }

    private async initializeSetup(user: User, guild: Guild, message: Message) {
        const defaultSetup = ModifyCommand.getDefaultSetupNotInitialized(user, guild, message);

        if(!this.userHasStartedSetup(user)) {
            const initializedSetup = await this.initializeDMChannel(defaultSetup);
            this.setupUsers.set(user.id, initializedSetup);
            logger.info(`Initialized Setup for user ${initializedSetup.user} and guild ${guild}`);
        }

        return await message.reply("Setup initialized please continue configuration in DM");
    }

    private static getDefaultSetupNotInitialized(user: User, guild: Guild, message: Message): EventState{
        const defaultEventInput: EventInputBuilder = new EventInputBuilder()
            .setCreatedDate(new Date())
            .setCreatedBy(user.id)
            .setServer(guild.id);

        return {
            step: 0,
            user: user,
            guild: guild,
            channel: message.channel,
            dmChannel: undefined,
            event: defaultEventInput
        };
    }

    private async initializeDMChannel(defaultSetup: EventState): Promise<EventState>{
        const {user} = defaultSetup;
        const dmChannel = await this.channelService.createDMChannelWithHandler(user, this.setupDMChannelHandler);
        const initializedSetup: EventState = {...defaultSetup, dmChannel: dmChannel};

        await this.sendInitialDM(initializedSetup);
        return initializedSetup;
    }

    private async sendInitialDM(eventState: EventState){
        await eventState.dmChannel.send(`Hi ${eventState.user.username}! You want to set me up for an event in ${eventState.guild}? I'll ask for the details, one at a time.`);
        await eventState.dmChannel.send(`To accept the suggested value, respond with "${BotConfig.defaultOptionMessage}"`);
        await this.setupDMChannelHandler.sendInitMessage(eventState);
    }

    public userHasStartedSetup(user: User): boolean {
        return this.setupUsers.has(user.id);
    }

    public getEventStateByUser(user: Snowflake): EventState{
        if(!this.setupUsers.has(user))
            return undefined;
        return this.setupUsers.get(user);
    }

    public async clearEventState(user: User): Promise<void>{
        const EventState = this.getEventStateByUser(user.id);
        if(!EventState)
            return;

        try {
            await this.channelService.deleteUserDMChannel(user, "Setup finished");
            this.setupUsers.delete(user.id);
        }catch (e){
            logger.error(`ClearEventState error: ${e}`);
        }
    }

    public async saveEvent(eventState: EventState): Promise<Message>{
        logger.info(`[SetupCommand] Saving event for user id ${eventState.user.id} and guild id ${eventState.guild.id}`);
        logger.debug(`[SetupCommand] Saving event: ${JSON.stringify(eventState.event)}`);
        const event: BotEventInput = eventState.event.build();
        try {
            const savedEvent = await this.eventService.saveEvent(event);
            await this.eventScheduleService.scheduleEvent(savedEvent);
            return ModifyCommand.checkSavedEvent(eventState, event, savedEvent);
        }catch(e){
            logger.error(`[SetupCommand] Error saving event, error: ${e}`);
            return await eventState.dmChannel.send(`Something went wrong, please try again in a few minutes or contact support.`);
        }
    }

    private static async checkSavedEvent(eventState: EventState, eventInput: BotEventInput, savedEvent: BotEvent): Promise<Message>{
        logger.info(`[SetupCommand] Saved event: ${JSON.stringify(savedEvent)}`);
        if(eventInput.codes.length !== savedEvent.codes.length)
            return await eventState.dmChannel.send(`Event saved but some codes may be repeated. Please check with command !status and !addcodes ${savedEvent.id} to add more codes!`);

        return await eventState.dmChannel.send(`Thank you. That's everything. I'll start the event at the appointed time.`);
    }
}
