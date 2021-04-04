import {Event} from "../event";
import {Code} from "../code";
import {EventInput} from "../input/eventInput";
import {CodeInput} from "../input/codeInput";

export class EventInputBuilder {
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

    build(): EventInput{
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

    get start_date(): Date {
        return this._startDate;
    }
}
