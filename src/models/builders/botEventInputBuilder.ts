import {BotEvent} from "../core/botEvent";
import {Code} from "../core/code";
import {BotEventInput} from "../input/botEventInput";
import {CodeInput} from "../input/codeInput";

export class BotEventInputBuilder {
    private _id: number;
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

    build(): BotEventInput{
        return {
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
        }
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

    get id(): number {
        return this._id;
    }

    get server(): string {
        return this._server;
    }

    get channel(): string {
        return this._channel;
    }

    get startDate(): Date {
        return this._startDate;
    }

    get endDate(): Date {
        return this._endDate;
    }

    get responseMessage(): string {
        return this._responseMessage;
    }

    get pass(): string {
        return this._pass;
    }

    get createdBy(): string {
        return this._createdBy;
    }

    get createdDate(): Date {
        return this._createdDate;
    }

    get fileUrl(): string {
        return this._fileUrl;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isWhitelisted(): boolean | null {
        return this._isWhitelisted;
    }

    get whitelistFileUrl(): string | null {
        return this._whitelistFileUrl;
    }

    get codes(): CodeInput[] {
        return this._codes;
    }
}
