import {Message} from "discord.js";

export abstract class Command {
    private readonly _name: string;
    private readonly _aliases: string[];
    private readonly _guildOnly: boolean;
    private readonly _permissions: string[];

    constructor(name: string, aliases:string[], guildOnly: boolean, permissions: string[]) {
        this._name = name;
        this._aliases = aliases;
        this._guildOnly = guildOnly;
        this._permissions = permissions;
    }

    abstract execute(message: Message, args: string[]);
    abstract isCommand(message: Message);

    get name(): string {
        return this._name;
    }
}
