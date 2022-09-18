import { TypedEmitter } from "tiny-typed-emitter";
import { Client, Guild } from "discord.js";
import { connect, Connection, connection, ConnectionStates, ConnectOptions } from "mongoose";
import { DKRCommandsEvents, ICommand, Options, Plugin } from "./interfaces";
import { CommandHandler, SlashCommands } from "./handlers";
import { GuildModel, LanguageModel, PrefixModel } from "./database/models";

export class DKRCommands extends TypedEmitter<DKRCommandsEvents> {
    private readonly _client: Client;
    private _commandsDir?: string;
    private prefix?: string;
    private _showWarns?: boolean;
    private _errorMessages?: boolean;
    private _ignoreBots?: boolean;
    private _ephemeral?: boolean;
    private _debug?: boolean;
    private _testServers?: string[];
    private _botOwners?: string[];
    private typeScript?: boolean;
    private mongoUri?: string;
    private dbOptions?: ConnectOptions;
    private _databaseBackwardCompatibility?: boolean;
    private _mongooseConnection?: Connection;
    private plugins?: Plugin[];

    private _commandHandler?: CommandHandler;
    private _slashCommands?: SlashCommands;

    constructor(client: Client, options?: Options) {
        super();

        this._client = client;
        this.checkAndSetup(client, options).then();
    }

    /**
     * Checks the parameters of the options object and creates and initializes the DKRCommands components.
     * @param client - Discord client
     * @param options - DKRCommands options object
     * @private
     */
    private async checkAndSetup(client: Client, options?: Options): Promise<void> {
        if (!client)
            throw new Error("No Discord JS Client provided as first argument!");

        const {
            commandsDir,
            prefix,
            showWarns,
            errorMessages,
            ignoreBots,
            testServers,
            botOwners,
            ephemeral,
            debug,
            typeScript,
            mongoUri,
            dbOptions,
            databaseBackwardCompatibility,
            plugins
        } = options || {};

        this._commandsDir = commandsDir;
        this.prefix = prefix;
        this._showWarns = showWarns;
        this._errorMessages = errorMessages;
        this._ignoreBots = ignoreBots;
        this._ephemeral = ephemeral;
        this._debug = debug;
        this.typeScript = typeScript;
        this.mongoUri = mongoUri;
        this.dbOptions = dbOptions;
        this._databaseBackwardCompatibility = databaseBackwardCompatibility;
        this.plugins = plugins;

        if (mongoUri) {
            await connect(mongoUri, {
                keepAlive: true,
                ...dbOptions,
            });

            this._mongooseConnection = connection;
            this.emit("databaseConnected", connection, connection.readyState);
        } else if (showWarns)
            console.warn("DKRCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://karel-kryda.gitbook.io/dkrcommands/databases/mongodb");

        if (this._commandsDir && !(this._commandsDir.includes("/") || this._commandsDir.includes("\\")))
            throw new Error("DKRCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://karel-kryda.gitbook.io/dkrcommands/setup-and-options-object");

        if (this.plugins && !Array.isArray(this.plugins))
            throw new Error("DKRCommands > Option 'plugins' must be a Plugin array. More info: https://karel-kryda.gitbook.io/dkrcommands/plugins/basic-info");

        if (this._errorMessages === false && showWarns)
            console.warn("DKRCommands > Default error messages will not be sent, remember to listen for all required events. See this for more details:\nhttps://karel-kryda.gitbook.io/dkrcommands/useful-information/error-messages-customization");

        if (testServers)
            this._testServers = (typeof testServers === "string") ? [testServers] : testServers;
        if (botOwners)
            this._botOwners = (typeof botOwners === "string") ? [botOwners] : botOwners;

        this._commandHandler = new CommandHandler(this, client, this._commandsDir || "", this.typeScript);
        this._slashCommands = new SlashCommands(this, true);

        if (this.plugins) {
            for (const [index, plugin] of this.plugins.entries()) {
                if (!(plugin instanceof Plugin))
                    throw new Error(`DKRCommands > Plugin at index ${index} does not extend Plugin.`);

                plugin.load(this);
            }
        }

        console.log("DKRCommands > Your bot is now running.");
    }

    /**
     * Returns either a language for the given server or the default language.
     * @param guild - Discord guild
     */
    public async getLanguage(guild: Guild): Promise<string> {
        let language;
        if (this.isDBConnected()) {
            // Use WOKCommands database schema
            if (this.databaseBackwardCompatibility)
                language = (await LanguageModel.findOne({ _id: guild?.id }))?.language;
            // Use DKRCommands database schema
            else
                language = (await GuildModel.findOne({ server: guild?.id }))?.language;
        }

        return language || "english";
    }

    /**
     * Sets a new language for the given server.
     * @param guild - Discord guild
     * @param newLanguage - New language
     */
    public async setLanguage(guild: Guild, newLanguage: string): Promise<string> {
        let language;
        if (this.isDBConnected()) {
            // Use WOKCommands database schema
            if (this.databaseBackwardCompatibility)
                language = (await LanguageModel.findOneAndUpdate({ _id: guild.id }, { language: newLanguage }, { new: true }))?.language;
            // Use DKRCommands database schema
            else
                language = (await GuildModel.findOneAndUpdate({ server: guild.id }, { language: newLanguage }, { new: true }))?.language;
        } else
            throw new Error("No MongoDB connection established.");

        return language || "english";
    }

    /**
     * Returns either a personalized prefix for the given server or the default prefix.
     * @param guild - Discord guild
     */
    public async getPrefix(guild: Guild | null): Promise<string> {
        let prefix;
        if (this.isDBConnected()) {
            // Use WOKCommands database schema
            if (this.databaseBackwardCompatibility)
                prefix = (await PrefixModel.findOne({ _id: guild?.id }))?.prefix;
            // Use DKRCommands database schema
            else
                prefix = (await GuildModel.findOne({ server: guild?.id }))?.prefix;
        }

        return prefix || this.prefix || "!";
    }

    /**
     * Sets a new prefix for the given server.
     * @param guild - Discord guild
     * @param newPrefix - New prefix
     */
    public async setPrefix(guild: Guild, newPrefix: string): Promise<string> {
        let prefix;
        if (this.isDBConnected()) {
            // Use WOKCommands database schema
            if (this.databaseBackwardCompatibility)
                prefix = (await PrefixModel.findOneAndUpdate({ _id: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;
            // Use DKRCommands database schema
            else
                prefix = (await GuildModel.findOneAndUpdate({ server: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;
        } else
            throw new Error("No MongoDB connection established.");

        return prefix || this.prefix || "!";
    }

    /**
     * Checks if the database is connected.
     */
    public isDBConnected(): boolean {
        return this._mongooseConnection?.readyState === ConnectionStates.connected;
    }

    get client(): Client {
        return this._client;
    }

    get showWarns(): boolean {
        return this._showWarns || false;
    }

    get errorMessages(): boolean {
        if (typeof this._errorMessages === "boolean")
            return this._errorMessages;
        else
            return true;
    }

    get ignoreBots(): boolean {
        return this._ignoreBots || false;
    }

    get ephemeral(): boolean {
        return this._ephemeral || false;
    }

    get testServers(): string[] {
        return this._testServers || [];
    }

    get botOwners(): string[] {
        return this._botOwners || [];
    }

    get databaseBackwardCompatibility(): boolean {
        return this._databaseBackwardCompatibility || false;
    }

    get mongooseConnection(): Connection | undefined {
        return this._mongooseConnection;
    }

    get commandHandler(): CommandHandler {
        return this._commandHandler || new CommandHandler(this, this._client, this._commandsDir || "", this.typeScript);
    }

    get slashCommands(): SlashCommands {
        return this._slashCommands || new SlashCommands(this, true);
    }
}

export {
    ICommand,
    Plugin
};
