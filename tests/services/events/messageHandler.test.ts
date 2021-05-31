import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {MessageHandler} from "../../../src/discord/events/messageHandler";
import {instance, mock, reset, verify, when} from "ts-mockito";
import {Message, User} from "discord.js";
import {Bot} from "../../../src/bot";
import {Command} from "../../../src/commands/command";
import {CommandLoader} from "../../../src/discord/loaders/commandLoader";
import {ChannelService} from "../../../src/interfaces/services/discord/channelService";
import {ChannelServiceImpl} from "../../../src/services/discord/channelServiceImpl";

describe('MessageResponder', () => {
    let mockedCommandLoaderClass: CommandLoader;
    let mockedCommandLoaderInstance: CommandLoader;
    let mockedChannelServiceClass: ChannelService;
    let mockedChannelServiceInstance: ChannelService;
    let mockedCommandClass: Command;
    let mockedCommandInstance: Command;
    let mockedAuthorClass: User;
    let mockedAuthorInstance: User;
    let mockedMessageClass: Message;
    let mockedMessageInstance: Message;

    let service: MessageHandler;

    beforeEach(() => {
        mockedCommandLoaderClass = mock(CommandLoader);
        mockedCommandLoaderInstance = instance(mockedCommandLoaderClass);
        mockedChannelServiceClass = mock(ChannelServiceImpl);
        mockedChannelServiceInstance = instance(mockedChannelServiceClass);
        mockedCommandClass = mock(Command);
        mockedCommandInstance = instance(mockedCommandClass);
        mockedAuthorClass = mock(User);
        mockedAuthorInstance = instance(mockedAuthorClass);
        mockedMessageClass = mock(Message);
        mockedMessageInstance = instance(mockedMessageClass);

        setMessageContents();

        service = new MessageHandler(mockedCommandLoaderInstance, mockedChannelServiceInstance);
    });

    it('should run', async () => {
        whenIsCommandByMessage(true);

        await service.handle(mockedMessageInstance);

        verify(mockedCommandClass.run(mockedMessageInstance)).once();
    })

    it('should not run', async () => {
        whenIsCommandByMessage(false);

        await shouldNotRun();
    });

    it('empty commands map should not run', async () => {
        whenCommandEmpty();
        await shouldNotRun();
    });

    async function shouldNotRun(){
        await service.handle(mockedMessageInstance).then(() => {
            // Successful promise is unexpected, so we fail the tests
            expect.fail('Unexpected promise');
        }).catch(() => {
            // Rejected promise is expected, so nothing happens here
        });

        verify(mockedCommandClass.run(mockedMessageInstance)).never();
    }

    function setMessageContents() {
        mockedMessageInstance.content = "Non-empty string";
        mockedMessageInstance.author = mockedAuthorClass;
        mockedMessageInstance.author.bot = false;
    }

    function whenIsCommandByMessage(result: boolean) {
        when(mockedCommandLoaderClass.commands).thenReturn([mockedCommandInstance]);
        when(mockedCommandClass.isCommandCalledByMessage(mockedMessageInstance)).thenReturn(Promise.resolve(result));
    }

    function whenCommandEmpty(){
        when(mockedCommandLoaderClass.commands).thenReturn([]);
    }
});
