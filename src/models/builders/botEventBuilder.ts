import {BotEvent} from "../core/botEvent";
import {Code} from "../core/code";
import {BotEventInput} from "../input/botEventInput";
import {CodeInput} from "../input/codeInput";

export class BotEventBuilder {
    private _id: number | string;
    private _server: string;
    private _channel: string;
    private _startDate: Date;
    private _endDate: Date;
    private _responseMessage: string;
    private _pass: string;
    private _createdBy: string;
    private _createdDate: Date;
    private _fileUrl: string;
    private _isActive: boolean;
    private _isWhitelisted: boolean | null;
    private _whitelistFileUrl: string | null;
    private _codes?: CodeInput[];
    constructor() {
    }

    build(): BotEvent{
        return {
            id: this._id,
            channel: this._channel,
            server: this._server,
            pass: this._pass,
            created_by: this._createdBy,
            created_date: this._createdDate,
            start_date: this._startDate,
            end_date: this._endDate,
            file_url: this._fileUrl,
            response_message: this._responseMessage,
            is_whitelisted: this._isWhitelisted,
            whitelist_file_url: this._whitelistFileUrl,
            codes: this._codes,
            is_active: this._isActive,
        }
    }

    static builderFromBotEvent(botEvent: BotEvent){
        const botEventBuilder = new BotEventBuilder();

        botEventBuilder.setId(botEvent.id);
        botEventBuilder.setChannel(botEvent.channel);
        botEventBuilder.setServer(botEvent.server);
        botEventBuilder.setPass(botEvent.pass);
        botEventBuilder.setCreatedBy(botEvent.created_by);
        botEventBuilder.setCreatedDate(botEvent.created_date);
        botEventBuilder.setStartDate(botEvent.start_date);
        botEventBuilder.setEndDate(botEvent.end_date);
        botEventBuilder.setFileUrl(botEvent.file_url);
        botEventBuilder.setResponseMessage(botEvent.response_message);
        botEventBuilder.setIsWhitelisted(botEvent.is_whitelisted);
        botEventBuilder.setWhitelistFileUrl(botEvent.whitelist_file_url);
        botEventBuilder.setCodes(botEvent.codes);
        botEventBuilder.setIsActive(botEvent.is_active);

        return botEventBuilder;
    }

    setId(value: number | string) {
        this._id = value;
        return this;
    }

    setServer(value: string) {
        this._server = value;
        return this;
    }

    setChannel(value: string) {
        this._channel = value;
        return this;
    }

    setStartDate(value: Date) {
        this._startDate = value;
        return this;
    }

    setEndDate(value: Date) {
        this._endDate = value;
        return this;
    }

    setResponseMessage(value: string) {
        this._responseMessage = value;
        return this;
    }

    setPass(value: string) {
        this._pass = value;
        return this;
    }

    setCreatedBy(value: string) {
        this._createdBy = value;
        return this;
    }

    setCreatedDate(value: Date) {
        this._createdDate = value;
        return this;
    }

    setFileUrl(value: string) {
        this._fileUrl = value;
        return this;
    }

    setIsActive(value: boolean) {
        this._isActive = value;
        return this;
    }

    setIsWhitelisted(value: boolean | null) {
        this._isWhitelisted = value;
        return this;
    }

    setWhitelistFileUrl(value: string | null) {
        this._whitelistFileUrl = value;
        return this;
    }

    setCodes(value: CodeInput[]){
        this._codes = value;
        return this;
    }

    get start_date(): Date {
        return this._startDate;
    }
}
