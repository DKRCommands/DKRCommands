import { EventEmitter } from "events";
import { Client, Guild } from "discord.js";
import { connect, ConnectOptions } from "mongoose";
import { ICommand, Options } from "./interfaces";
import { CommandHandler, SlashCommands } from "./handlers";
import { GuildModel, PrefixModel } from "./database/models";

export class DKRCommands extends EventEmitter {
    private readonly _client: Client;
    private _commandsDir?: string;
    private prefix?: string;
    private _showWarns?: boolean;
    private _ignoreBots?: boolean;
    private _ephemeral?: boolean;
    private _debug?: boolean;
    private _testServers?: string[];
    private _botOwners?: string[];
    private typescript?: boolean;
    private mongoUri?: string;
    private dbOptions?: ConnectOptions;
    private databaseBackwardCompatibility?: boolean;

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
    private async checkAndSetup(client: Client, options?: Options) {
        if (!client)
            throw new Error("No Discord JS Client provided as first argument!");

        const {
            commandsDir,
            prefix,
            showWarns,
            ignoreBots,
            testServers,
            botOwners,
            ephemeral,
            debug,
            typescript,
            mongoUri,
            dbOptions,
            databaseBackwardCompatibility
        } = options || {};

        this._commandsDir = commandsDir;
        this.prefix = prefix;
        this._showWarns = showWarns;
        this._ignoreBots = ignoreBots;
        this._ephemeral = ephemeral;
        this._debug = debug;
        this.typescript = typescript;
        this.mongoUri = mongoUri;
        this.dbOptions = dbOptions;
        this.databaseBackwardCompatibility = databaseBackwardCompatibility;

        if (mongoUri)
            await connect(mongoUri, {
                keepAlive: true,
                ...dbOptions,
            });
        else if (showWarns)
            console.warn("DKRCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://karel-kryda.gitbook.io/dkrcommands/databases/mongodb");

        if (this._commandsDir && !(this._commandsDir.includes("/") || this._commandsDir.includes("\\")))
            throw new Error("DKRCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object");

        if (testServers)
            this._testServers = (typeof testServers === "string") ? [testServers] : testServers;
        if (botOwners)
            this._botOwners = (typeof botOwners === "string") ? [botOwners] : botOwners;

        this._commandHandler = new CommandHandler(this, client, this._commandsDir || "", this.typescript);
        this._slashCommands = new SlashCommands(this, true);

        console.log("DKRCommands > Your bot is now running.");
    }

    /**
     * Returns either a personalized prefix for the given server or the default prefix.
     * @param guild - Discord guild
     */
    public async getPrefix(guild: Guild | null): Promise<string> {
        let prefix;
        // Use WOKCommands database schema
        if (this.databaseBackwardCompatibility)
            prefix = (await PrefixModel.findOne({ _id: guild?.id }))?.prefix;
        // Use DKRCommands database schema
        else
            prefix = (await GuildModel.findOne({ server: guild?.id }))?.prefix;

        return prefix || this.prefix || "!";
    }

    /**
     * Sets a new prefix for the given server.
     * @param guild - Discord guild
     * @param newPrefix - New prefix
     */
    public async setPrefix(guild: Guild, newPrefix: string): Promise<string> {
        let prefix;
        // Use WOKCommands database schema
        if (this.databaseBackwardCompatibility)
            prefix = (await PrefixModel.findOneAndUpdate({ _id: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;
        // Use DKRCommands database schema
        else
            prefix = (await GuildModel.findOneAndUpdate({ server: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;

        return prefix || this.prefix || "!";
    }

    get client(): Client {
        return this._client;
    }

    get showWarns(): boolean {
        return this._showWarns || false;
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

    get commandHandler(): CommandHandler {
        return this._commandHandler || new CommandHandler(this, this._client, this._commandsDir || "", this.typescript);
    }

    get slashCommands(): SlashCommands {
        return this._slashCommands || new SlashCommands(this, true);
    }
}

export {
    ICommand
};
