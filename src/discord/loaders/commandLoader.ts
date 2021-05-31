import {injectable} from "inversify";
import {lstatSync, readdirSync} from "fs";
import {logger} from "../../logger";
import * as path from "path";
import {Command} from "../../commands/command";
import {BotConfig} from "../../config/bot.config";

const commandsPath = __dirname + `${path.sep}..${path.sep}..${path.sep}` + `commands` + path.sep;

@injectable()
export class CommandLoader{
    private readonly _commands: Array<Command>;
    constructor() {
        this._commands = new Array<Command>();
    }

    init(){
        this.loadCommandsFromDefaultPath();
        this.commands.sort((a, b) => b.priority - a.priority);
    }

    get commands(): Array<Command> {
        return this._commands;
    }

    private loadCommandsFromDefaultPath(){
        const commandsFolder = this.getCommandFolders(commandsPath);
        logger.info(`Loading a total of ${commandsFolder.length} categories.`);

        commandsFolder.forEach((commandFilePath) => {
            logger.info(`Loading ${commandFilePath} directory`);
            const commandsFiles = this.getCommandJSFiles(commandFilePath);
            commandsFiles.forEach(async (cmd) => {
                await this.loadCommandFromPath(commandFilePath, cmd);
            });
        });


    }

    private getCommandFolders(folderPath: string): string[]{
        return readdirSync(folderPath)
            .filter(dir => lstatSync(folderPath + dir).isDirectory())
            .map(dir =>  folderPath + dir);
    }

    private getCommandJSFiles(commandPath: string): string[]{
        return readdirSync(commandPath)
            .filter(cmd => {
                const split = cmd.split(".");
                return split.pop() === "js" && split.pop() === BotConfig.commandFilePrefix;
            });
        //.map(dir => commandPath + dir + path.sep);
    }

    private async loadCommandFromPath(commandDir: string, commandName: string): Promise<string | Command> {
        try {
            const commandPath= `${commandDir}${path.sep}${commandName}`;
            logger.info(`Loading ${commandPath}`);
            const commandClass = require(commandPath).default;
            return this.loadCommand(new commandClass() as Command);
        } catch (e) {
            logger.error(`Unable to load command ${commandName}: ${e}`);
            return e;
        }
    }

    private loadCommand(command: Command): Command{
        if(!(command instanceof Command)){
            logger.error(`Command is not instance of Command, instance: ${command}`)
        }

        logger.info(`Loading Command: ${command.name}. 👌`);
        this._commands.push(command);
        return command;
    }
}
