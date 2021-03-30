import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {EventInputBuilder} from "../../models/builders/eventInputBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {ChannelManager} from "../../_helpers/utils/channelManager";
import {EventService} from "../../interfaces/services/core/eventService";
import {TYPES} from "../../config/types";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {SetupState} from "../../interfaces/command/setup/setup.interface";
import {Event} from "../../models/event";
import {SetupDMChannelHandler} from "./handlers/setupDMChannelHandler";
import {EventInput} from "../../models/input/eventInput";
import {EventScheduleService} from "../../interfaces/services/schedule/eventScheduleService";

const { lazyInject } = getDecorators(container);

export default class SetupCommand extends Command{
    private setupUsers: Map<Snowflake, SetupState>;
    private readonly setupDMChannelHandler: SetupDMChannelHandler;

    @lazyInject(TYPES.EventService) eventService: EventService;
    @lazyInject(TYPES.EventScheduleService) eventScheduleService: EventScheduleService;
    constructor() {
        super("setup", {
                                        aliases: [],
                                        commandType: {DMCommand: false, GuildCommand: true},
                                        botPermissions: [],
                                        memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
        this.setupUsers = new Map();
        this.setupDMChannelHandler = new SetupDMChannelHandler(this, this.eventService);
    }

    protected async execute(commandContext: CommandContext): Promise<Message | Message[]> {
        const message = commandContext.message;
        const user = message.member.user;
        const guild = message.guild;

        if(this.userHasStartedSetup(user)){
            return await message.reply("You already have another setup initialized.");
        }

        return this.initializeSetup(user, guild, message);
    }

    private userHasStartedSetup(user: User): boolean {
        return this.setupUsers.has(user.id);
    }

    //TODO expiry clear user from map
    private async initializeSetup(user: User, guild: Guild, message: Message) {
        const defaultEventInput: EventInputBuilder = new EventInputBuilder()
                                                        .setCreatedDate(new Date())
                                                        .setCreatedBy(user.id)
                                                        .setServer(guild.id);
        const defaultSetup: SetupState = {
            step: 0,
            user: user,
            guild: guild,
            channel: message.channel,
            dmChannel: undefined,
            event: defaultEventInput,
            expire: 0
        };

        if(!this.userHasStartedSetup(user)) {
            const initializedSetup = await this.initializeDMChannel(defaultSetup);
            this.setupUsers.set(user.id, initializedSetup);
            logger.info(`Initialized Setup for user ${initializedSetup.user} and guild ${guild}`);
        }

        return await message.reply("Setup initialized please continue configuration in DM");
    }

    private async initializeDMChannel(defaultSetup: SetupState): Promise<SetupState>{
        const {user} = defaultSetup;
        const dmChannel = await ChannelManager.createDMWithHandler(user, this.setupDMChannelHandler);
        const initializedSetup: SetupState = {...defaultSetup, dmChannel: dmChannel};

        await this.sendInitialDM(initializedSetup);
        return initializedSetup;
    }

    private async sendInitialDM(setupState: SetupState){
        await setupState.dmChannel.send(`Hi ${setupState.user.username}! You want to set me up for an event in ${setupState.guild}? I'll ask for the details, one at a time.`);
        await setupState.dmChannel.send(`To accept the suggested value, respond with "${BotConfig.defaultOptionMessage}"`);
        await this.setupDMChannelHandler.sendInitMessage(setupState);
    }

    public getSetupStateByUser(user: Snowflake): SetupState{
        if(!this.setupUsers.has(user))
            return undefined;
        return this.setupUsers.get(user);
    }

    public async clearSetupState(setupState: SetupState): Promise<void>{
        try {
            await setupState.dmChannel.delete("Setup finished");
            this.setupUsers.delete(setupState.user.id);
        }catch (e){
            logger.error(`ClearSetupState error: ${e}`);
        }
    }

    public async saveEvent(setupState: SetupState): Promise<Message>{
        logger.info(`Saving event: ${setupState.event} for user ${setupState.user} and guild ${setupState.guild}`);
        const event: EventInput = setupState.event.build();
        try {
            const savedEvent = await this.eventService.saveEvent(event, setupState.user.username);
            await this.eventScheduleService.scheduleEvent(savedEvent);
            logger.info(`Saved event: ${setupState.event}`);
        }catch(e){
            logger.error(`Error saving event, error: ${e}`);
        }

        return await setupState.dmChannel.send(`Thank you. That's everything. I'll start the event at the appointed time.`);
    }
}
