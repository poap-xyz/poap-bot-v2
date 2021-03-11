import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingFinder} from "../../src/commands/ping-finder";
import {MessageHandler} from "../../src/services/events/message-handler";
import {instance, mock, verify, when} from "ts-mockito";
import {Message} from "discord.js";

describe('MessageResponder', () => {
    let mockedPingFinderClass: PingFinder;
    let mockedPingFinderInstance: PingFinder;
    let mockedMessageClass: Message;
    let mockedMessageInstance: Message;

    let service: MessageHandler;

    beforeEach(() => {
        mockedPingFinderClass = mock(PingFinder);
        mockedPingFinderInstance = instance(mockedPingFinderClass);
        mockedMessageClass = mock(Message);
        mockedMessageInstance = instance(mockedMessageClass);
        setMessageContents();

        service = new MessageHandler(mockedPingFinderInstance);
    })

    it('should reply', async () => {
        whenIsPingThenReturn(true);

        await service.handle(mockedMessageInstance);

        verify(mockedMessageClass.reply('pong!')).once();
    })

    it('should not reply', async () => {
        whenIsPingThenReturn(false);

        await service.handle(mockedMessageInstance).then(() => {
            // Successful promise is unexpected, so we fail the test
            expect.fail('Unexpected promise');
        }).catch(() => {
            // Rejected promise is expected, so nothing happens here
        });

        verify(mockedMessageClass.reply('pong!')).never();
    })

    function setMessageContents() {
        mockedMessageInstance.content = "Non-empty string";
    }

    function whenIsPingThenReturn(result: boolean) {
        when(mockedPingFinderClass.isPing("Non-empty string")).thenReturn(result);
    }
});
