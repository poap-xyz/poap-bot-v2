import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingFinder} from "../../src/commands/ping-finder";
import {CommandContext} from "../../src/commands/commandContext";
import {Message} from "discord.js";
import {CommandOptions} from "../../src/commands/commandOptions";
import {instance, mock} from "ts-mockito";
import {BotConfig} from "../../src/config/bot.config";

describe('CommandContext', () => {
    let mockedMessageClass: Message;
    let mockedMessageInstance: Message;
    let mockedCommandOptionsInterface: CommandOptions;
    let mockedCommandName: string;
    let service: CommandContext;

    beforeEach(() => {
        mockedMessageClass = mock(Message);
        mockedMessageInstance = instance(mockedMessageClass);
        mockedCommandOptionsInterface = mock<CommandOptions>();
        setDefaultCommandOptions();
        setDefaultMessageContents()
    })

    /* Default command test options must not be called by the message */
    function setDefaultCommandOptions() {
        mockedCommandName = "someCommandName";
        mockedCommandOptionsInterface.aliases = [];
    }

    function setDefaultMessageContents() {
        mockedMessageInstance.content = "Non-empty string"
    }

    it('should find principal name in message', () => {
        mockedCommandName = "testCommand";
        setMessageForCommandExecution(mockedCommandName);
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.true
    });

    it('should find principal case insensitive name in message', () => {
        mockedCommandName = "testCommand";
        setMessageForCommandExecution("TeStCommAnD");
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.true
        expect(service.parsedCommandName).to.be.string("TeStCommAnD".toLowerCase());
    });

    it('should not find principal name in message', () => {
        mockedCommandName = "testCommand";
        setMessageForCommandExecution("invalidTestCommand");
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.false;
        expect(service.parsedCommandName).to.be.string("invalidTestCommand".toLowerCase());
    });

    it('should find case sensitive alias name in message', () => {
        mockedCommandOptionsInterface.aliases = ["tstCmd", "tstCmd1"];
        setMessageForCommandExecution("tstCmd1");
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.true;
        expect(service.parsedCommandName).to.be.string("tstCmd1".toLowerCase());
    });

    it('should not find case insensitive alias name in message', () => {
        mockedCommandOptionsInterface.aliases = ["tstCmd", "tstCmd1"];
        setMessageForCommandExecution("invalidTstCmd")
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.false;
        expect(service.parsedCommandName).to.be.string("invalidTstCmd".toLowerCase());
    });

    function setMessageForCommandExecution(commandName: string){
        mockedMessageInstance.content = BotConfig.prefix+commandName;
    }

    it('should not parse command name in message without prefix', () => {
        /* Default configuration must not use the prefix */
        service = new CommandContext(mockedMessageInstance, mockedCommandName, mockedCommandOptionsInterface);
        expect(service.isCommandCalledByMessage()).to.be.false
        expect(service.parsedCommandName).to.be.null
    });
});
