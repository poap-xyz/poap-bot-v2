import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Channel, ClientUser, DMChannel, Guild, GuildChannel, Message, Permissions, Snowflake, User} from "discord.js";
import {EventBuilder} from "../../models/builders/eventBuilder";
export type SetupStepsType = 'NONE' | 'CHANNEL' | 'START' | 'END' | 'START_MSG' | 'END_MSG' | 'RESPONSE' |'REACTION' | 'PASS' | 'FILE';

export type SetupState = {
    step: SetupStepsType,
    user: User,
    guild: Guild,
    channel: Channel,
    dmChannel: DMChannel,
    event: EventBuilder,
    expire: number,
}

export default class Setup extends Command{
    private setupUsers: Map<Snowflake, SetupState>;

    constructor() {
        super("setup",
            { aliases: [],
            commandType: {DMCommand: false, GuildCommand: true},
            botPermissions: [],
            memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]});
        this.setupUsers = new Map();
    }

    protected async execute(commandContext: CommandContext): Promise<Message | Message[]> {
        const message = commandContext.message;
        const user = message.member.user;
        const guild = message.guild;

        if(this.userHasStartedSetup(user) || this.guildHasEventActive(guild)){
            return await message.reply("You already have another setup initialized.");
        }
        return this.initializeSetup(user, guild, message);
    }

    private userHasStartedSetup(user: User): boolean {
        return this.setupUsers.has(user.id);
    }

    private guildHasEventActive(guild: Guild){
        //TODO check for events in db
        return false;
    }

    //TODO expiry clear user from map
    private async initializeSetup(user: User, guild: Guild, message: Message) {
        const defaultSetup: SetupState = {
            step: 'CHANNEL',
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
        const dmChannel = await user.createDM();
        const initializedSetup: SetupState = {...defaultSetup, dmChannel: dmChannel};

        this.addHandlerToDMChannel(dmChannel, user);
        await this.sendInitialDM(initializedSetup);
        return initializedSetup;
    }

    private async sendInitialDM(initializedSetup: SetupState){
        await initializedSetup.dmChannel.send(`Hi ${initializedSetup.user.username}! You want to set me up for an event in ${initializedSetup.guild}? I'll ask for the details, one at a time.`);
        await initializedSetup.dmChannel.send(`To accept the suggested value, respond with "-"`);
        await initializedSetup.dmChannel.send(`First: which channel should I speak in public? (${initializedSetup.channel || ""}) *Hint: only for start and end event`);
    }

    private addHandlerToDMChannel(dmChannel: DMChannel, user: User){
        /* We set the collector to collect all the user messages */
        const collector = dmChannel.createMessageCollector((m: Message) => m.author.id === user.id, {});
        collector.on('collect', m => this.DMChannelHandler(m, user));
        return dmChannel;
    }

    private DMChannelHandler(message: Message, user: User){
        const setupState: SetupState = this.setupUsers.get(user.id);
        console.log(`Guacho ${message.content} ${setupState.step}`)
        switch (setupState.step){
            case "CHANNEL":
                this.channelStepHandler(message, setupState);
                break;
        }
    }

    private channelStepHandler(message: Message, setupState: SetupState){
        setupState.dmChannel.send(`Eyy ${message.content}`);
        setupState.step = "START_MSG";
    }


}