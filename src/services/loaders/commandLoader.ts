import {inject, injectable} from "inversify";
import {lstatSync, readdirSync} from "fs";
import {TYPES} from "../../config/types";
import {logger} from "../../logger";
import * as path from "path";
import {Command} from "../../commands/command";

@injectable()
export class CommandLoader{
    private readonly _commands: Map<string, Command>;
    constructor() {
        this._commands = new Map();
        this.loadCommandsFromDefaultPath();
    }

    get commands(): Map<string, Command> {
        return this._commands;
    }

    private loadCommandsFromDefaultPath(){
        const folderPath = __dirname + `${path.sep}..${path.sep}..${path.sep}` + `commands` + path.sep;
        const commandsFolder = this.getCommandFolders(folderPath);
        logger.info(`Loading a total of ${commandsFolder.length} categories.`);

        commandsFolder.forEach((commandFilePath) => {
            logger.info(`Loading ${commandFilePath} directory`);
            const commandsFiles = this.getCommandJSFiles(commandFilePath);
            commandsFiles.forEach((cmd) => {
                this.loadCommandFromPath(commandFilePath, cmd);
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
            .filter(cmd => cmd.split(".").pop() === "js");
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
            logger.error(`Command is not instance of Command `)
        }
        logger.info(`Loading Command: ${command.name}. 👌`);
        this._commands.set(command.name, command);
        return command;
    }
}