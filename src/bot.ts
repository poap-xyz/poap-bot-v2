import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./config/types";
import {MessageHandler} from "./services/events/messageHandler";
import {Command} from "./commands/command";
import {lstatSync, readdir, readdirSync} from "fs";
import * as pino from "pino";
import * as path from "path";

@injectable()
export class Bot {
    private readonly client: Client;
    private readonly token: string;
    private readonly messageHandler: MessageHandler;
    private readonly _commands: Map<string, Command>;
    private readonly logger: pino.Logger;

    constructor(@inject(TYPES.Client) client: Client,
                @inject(TYPES.Token) token: string,
                @inject(TYPES.MessageHandler) messageHandler,
                @inject(TYPES.Logger) logger) {
        this.client = client;
        this.token = token;
        this.messageHandler = messageHandler;
        this._commands = new Map();
        this.logger = logger;
    }

    public async init(){
        this.loadCommandsFromDefaultPath();
        await this.listen();
    }

    get commands(): Map<string, Command> {
        //TODO make it inmutable
        return this._commands;
    }

    private loadCommandsFromDefaultPath(){
        const folderPath = __dirname + path.sep + `commands` + path.sep;
        const commandsFolder = Bot.getCommandFolders(folderPath);
        this.logger.info(`Loading a total of ${commandsFolder.length} categories.`);

        commandsFolder.forEach((commandFilePath) => {
            this.logger.info(`Loading ${commandFilePath} directory`);
            const commandsFiles = Bot.getCommandJSFiles(commandFilePath);
            commandsFiles.forEach((cmd) => {
                this.loadCommandFromPath(commandFilePath, cmd);
            });
        });
    }

    private static getCommandFolders(folderPath: string): string[]{
        return readdirSync(folderPath)
                .filter(dir => lstatSync(folderPath + dir).isDirectory())
                .map(dir =>  folderPath + dir);
    }

    private static getCommandJSFiles(commandPath: string): string[]{
        return readdirSync(commandPath)
                .filter(cmd => cmd.split(".").pop() === "js");
                //.map(dir => commandPath + dir + path.sep);
    }

    private async loadCommandFromPath(commandDir: string, commandName: string): Promise<string | Command> {
        try {
            const commandPath= `${commandDir}${path.sep}${commandName}`;
            this.logger.info(`Loading ${commandPath}`);
            const { Ping } = await import(commandPath);
            return this.loadCommand(Ping);
        } catch (e) {
            this.logger.error(`Unable to load command ${commandName}: ${e}`);
            return e;
        }
    }

    private loadCommand(command: Command): Command{
        if(!(command instanceof Command)){
            this.logger.error(`Command is not instance of Command `)
        }
        this.logger.info(`Loading Command: ${command.name}. 👌`);

        this._commands.set(command.name, command);
        return command;
    }

    private listen(): Promise<string> {
        this.client.on('message', (message: Message) => {
            console.log("Message received! Contents: ", message.content);

        this.messageHandler.handle(message).then(() => {
                console.log("Response sent!");
            }).catch(() => {
                console.log("Response not sent.")
            })
        });

        return this.client.login(this.token);
    }
}
