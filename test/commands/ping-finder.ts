import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingFinder} from "../../src/commands/ping-finder";

describe('PingFinder', () => {
    let service: PingFinder;
    beforeEach(() => {
        service = new PingFinder();
    })

    it('should find "ping" in the string', () => {
        expect(service.isPing("ping")).to.be.true
    })
});
