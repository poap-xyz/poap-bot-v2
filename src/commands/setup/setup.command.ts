import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {EventBuilder} from "../../models/builders/eventBuilder";
import {logger} from "../../logger";
import {BotConfig} from "../../config/bot.config";
import {SetupChannelStepHandler} from "./setupChannelStepHandler";
import {SetupResponseStepHandler} from "./setupResponseStepHandler";
import {ChannelManager} from "../../_helpers/utils/channelManager";
import {EventService} from "../../interfaces/services/eventService";
import {TYPES} from "../../config/types";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {SetupState, SetupStep} from "../../interfaces/command/setup/setup.interface";
import {SetupDateStartStepHandler} from "./setupDateStartStepHandler";
import {SetupDateEndStepHandler} from "./setupDateEndStepHandler";
import {SetupPassStepHandler} from "./setupPassStepHandler";
import {Event} from "../../models/event";
import {SetupDMChannelHandler} from "./setupDMChannelHandler";

const { lazyInject } = getDecorators(container);

export default class Setup extends Command{
    private setupUsers: Map<Snowflake, SetupState>;
    private readonly setupDMChannelHandler: SetupDMChannelHandler;
    readonly setupSteps: SetupStep[];
    @lazyInject(TYPES.EventService) eventService: EventService;

    constructor() {
        super("setup", {
                                        aliases: [],
                                        commandType: {DMCommand: false, GuildCommand: true},
                                        botPermissions: [],
                                        memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
        this.setupUsers = new Map();
        this.setupSteps = this.initializeSetupStepsList();
        this.setupDMChannelHandler = new SetupDMChannelHandler(this, this.eventService);
    }

    private initializeSetupStepsList(): SetupStep[]{
        return [
            new SetupChannelStepHandler(),
            new SetupDateStartStepHandler(),
            new SetupDateEndStepHandler(),
            new SetupResponseStepHandler(),
            new SetupPassStepHandler(this.eventService),
        ];
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
        const defaultSetup: SetupState = {
            step: 0,
            user: user,
            guild: guild,
            channel: message.channel,
            dmChannel: undefined,
            event: new EventBuilder(),
            expire: 0
        };

        if(!this.userHasStartedSetup(user)) {
            const initializedSetup = await this.initializeDMChannel(defaultSetup);
            this.setupUsers.set(user.id, initializedSetup);
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
        await this.setupSteps[setupState.step].sendInitMessage(setupState);
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
        logger.error(`Saving event: ${setupState.event}`);
        const event: Event = setupState.event.build();
        try {
            await this.eventService.saveEvent(event, setupState.user.username);
        }catch(e){
            logger.error(`Error saving event, error: ${e}`);
        }

        return await setupState.dmChannel.send(`Thank you. That's everything. I'll start the event at the appointed time.`);
    }
}
