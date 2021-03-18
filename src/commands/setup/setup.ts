import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {ClientUser, DMChannel, Guild, Message, Permissions, Snowflake, User} from "discord.js";
import {EventBuilder} from "../../models/builders/eventBuilder";
export type SetupStepsType = 'NONE' | 'CHANNEL' | 'START' | 'END' | 'START_MSG' | 'END_MSG' | 'RESPONSE' |'REACTION' | 'PASS' | 'FILE';

export type SetupState = {
    step: SetupStepsType,
    user: User,
    dm: DMChannel,
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
        const dmChannel = await this.userCreateDMHandler(user);
        const initialSetup: SetupState = {
            step: 'START',
            user: user,
            dm: dmChannel,
            event: new EventBuilder(),
            expire: 0
        };

        if(!this.userHasStartedSetup(user))
            this.setupUsers.set(user.id, initialSetup);

        return await message.reply("Setup initialized please continue configuration in DM");
    }

    private async userCreateDMHandler(user: User): Promise<DMChannel>{
        const dmChannel = await user.createDM();
        const collector = dmChannel.createMessageCollector(() => true, {});

        collector.on('collect', m => console.log(`Collected ${m.content}`));
        await dmChannel.send("hola");
        return dmChannel;
    }
}