import { Client, GuildMember, Message, TextChannel } from "discord.js";
import { DKRCommands } from "../index";
import { ICallbackObject, ICommand, IErrorObject } from "../interfaces";

/**
 * A class containing a constructor for individual commands.
 */
export class Command {
    private readonly _instance: DKRCommands;
    private readonly _client: Client;
    private readonly _names: string[];
    private readonly _description: string;
    private readonly _permissions: bigint[] | undefined;
    private readonly _ownerOnly: boolean;
    private readonly _guildOnly: boolean;
    private readonly _testOnly: boolean;
    private readonly _slash: boolean | "both";

    public callback: (obj: ICallbackObject) => void;
    public error: (obj: IErrorObject) => void;

    constructor(instance: DKRCommands, client: Client, names: string[], callback: () => void, error: () => void, {
        description,
        permissions,
        ownerOnly = false,
        guildOnly = false,
        testOnly = false,
        slash = false
    }: ICommand) {
        this._instance = instance;
        this._client = client;
        this._names = names;
        this._description = description;
        this._permissions = permissions;
        this._ownerOnly = ownerOnly;
        this._guildOnly = guildOnly;
        this._testOnly = testOnly;
        this._slash = slash;
        this.callback = callback;
        this.error = error;
    }

    /**
     * Calls the callback method of the legacy command.
     * @param message - Discord message
     * @param args - command arguments
     */
    public async execute(message: Message, args: string[]): Promise<void> {
        await this.callback({
            instance: this._instance,
            client: this._client,
            message,
            guild: message.guild,
            member: message.member as GuildMember,
            channel: message.channel as TextChannel,
            prefix: this._instance.getPrefix(message.guild),
            args,
            text: args.join(" "),
            user: message.author
        });
    }

    get name(): string {
        return this._names[0] || "";
    }

    get permissions(): bigint[] {
        return this._permissions || [];
    }

    get ownerOnly(): boolean {
        return this._ownerOnly;
    }

    get guildOnly(): boolean {
        return this._guildOnly;
    }

    get testOnly(): boolean {
        return this._testOnly;
    }

    get slash(): boolean | "both" {
        return this._slash;
    }
}
