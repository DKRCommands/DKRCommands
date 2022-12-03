import { TypedEmitter } from "tiny-typed-emitter";
import { Client, Guild } from "discord.js";
import { Connection } from "mongoose";
import { DKRCommandsEvents, ICommand, Options, Plugin } from "./interfaces";
import { CommandHandler, EventHandler, SlashCommands } from "./handlers";
export declare class DKRCommands extends TypedEmitter<DKRCommandsEvents> {
    private readonly _client;
    private _commandsDir?;
    private eventsDir?;
    private prefix?;
    private _showWarns?;
    private _errorMessages?;
    private _ignoreBots?;
    private _ephemeral?;
    private _debug?;
    private _testServers?;
    private _botOwners?;
    private typeScript?;
    private mongoUri?;
    private dbOptions?;
    private _databaseBackwardCompatibility?;
    private _mongooseConnection?;
    private plugins?;
    private _commandHandler?;
    private _slashCommands?;
    private _eventHandler?;
    constructor(client: Client, options?: Options);
    private checkAndSetup;
    getLanguage(guild: Guild): Promise<string>;
    setLanguage(guild: Guild, newLanguage: string): Promise<string>;
    getPrefix(guild: Guild | null): Promise<string>;
    setPrefix(guild: Guild, newPrefix: string): Promise<string>;
    isDBConnected(): boolean;
    get client(): Client;
    get showWarns(): boolean;
    get errorMessages(): boolean;
    get ignoreBots(): boolean;
    get ephemeral(): boolean;
    get testServers(): string[];
    get botOwners(): string[];
    get databaseBackwardCompatibility(): boolean;
    get mongooseConnection(): Connection | undefined;
    get commandHandler(): CommandHandler;
    get slashCommands(): SlashCommands;
    get eventHandler(): EventHandler;
    get djsVersion(): string;
}
export { ICommand, Plugin };