import {Event} from "../event";

export class EventBuilder{
    private _id: number;
    private _server: string;
    private _channel: string;
    private _start_date: Date;
    private _end_date: Date;
    private _response_message: string;
    private _pass: string;
    private _created_by: string;
    private _created_date: Date;
    private _file_url: string;
    private _is_active: boolean;
    private _is_whitelisted: boolean | null;
    private _whitelist_file_url: string | null;

    build(): Event{
        return {
            id: this._id,
            channel: this._channel,
            server: this._server,
            pass: this._pass,
            created_by: this._created_by,
            created_date: this._created_date,
            start_date: this._start_date,
            end_date: this._end_date,
            file_url: this._file_url,
            is_active: this._is_active,
            response_message: this._response_message,
            is_whitelisted: this._is_whitelisted,
            whitelist_file_url: this._whitelist_file_url
        }
    }

    set id(value: number) {
        this._id = value;
    }

    set server(value: string) {
        this._server = value;
    }

    set channel(value: string) {
        this._channel = value;
    }

    set start_date(value: Date) {
        this._start_date = value;
    }

    set end_date(value: Date) {
        this._end_date = value;
    }

    set response_message(value: string) {
        this._response_message = value;
    }

    set pass(value: string) {
        this._pass = value;
    }

    set created_by(value: string) {
        this._created_by = value;
    }

    set created_date(value: Date) {
        this._created_date = value;
    }

    set file_url(value: string) {
        this._file_url = value;
    }

    set is_active(value: boolean) {
        this._is_active = value;
    }

    set is_whitelisted(value: boolean | null) {
        this._is_whitelisted = value;
    }

    set whitelist_file_url(value: string | null) {
        this._whitelist_file_url = value;
    }
}