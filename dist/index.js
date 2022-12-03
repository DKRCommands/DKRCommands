"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.DKRCommands = void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const interfaces_1 = require("./interfaces");
Object.defineProperty(exports, "Plugin", { enumerable: true, get: function () { return interfaces_1.Plugin; } });
const handlers_1 = require("./handlers");
const models_1 = require("./database/models");
class DKRCommands extends tiny_typed_emitter_1.TypedEmitter {
    _client;
    _commandsDir;
    eventsDir;
    prefix;
    _showWarns;
    _errorMessages;
    _ignoreBots;
    _ephemeral;
    _debug;
    _testServers;
    _botOwners;
    typeScript;
    mongoUri;
    dbOptions;
    _databaseBackwardCompatibility;
    _mongooseConnection;
    plugins;
    _commandHandler;
    _slashCommands;
    _eventHandler;
    constructor(client, options) {
        super();
        this._client = client;
        this.checkAndSetup(client, options).then();
    }
    async checkAndSetup(client, options) {
        if (!client)
            throw new Error("No Discord JS Client provided as first argument!");
        const { commandsDir, eventsDir, prefix, showWarns, errorMessages, ignoreBots, testServers, botOwners, ephemeral, debug, typeScript, mongoUri, dbOptions, databaseBackwardCompatibility, plugins } = options || {};
        this._commandsDir = commandsDir;
        this.eventsDir = eventsDir;
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
            await (0, mongoose_1.connect)(mongoUri, {
                keepAlive: true,
                ...dbOptions,
            });
            this._mongooseConnection = mongoose_1.connection;
            this.emit("databaseConnected", mongoose_1.connection, mongoose_1.connection.readyState);
        }
        else if (showWarns)
            console.warn("DKRCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://karel-kryda.gitbook.io/dkrcommands/databases/mongodb");
        if (this._commandsDir && !(this._commandsDir.includes("/") || this._commandsDir.includes("\\")))
            throw new Error("DKRCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://karel-kryda.gitbook.io/dkrcommands/setup-and-options-object");
        if (this.eventsDir && !(this.eventsDir.includes("/") || this.eventsDir.includes("\\")))
            throw new Error("DKRCommands > The 'events' directory must be an absolute path. This can be done by using the 'path' module. More info: https://karel-kryda.gitbook.io/dkrcommands/setup-and-options-object");
        if (this.plugins && !Array.isArray(this.plugins))
            throw new Error("DKRCommands > Option 'plugins' must be a Plugin array. More info: https://karel-kryda.gitbook.io/dkrcommands/plugins/basic-info");
        if (this._errorMessages === false && showWarns)
            console.warn("DKRCommands > Default error messages will not be sent, remember to listen for all required events. See this for more details:\nhttps://karel-kryda.gitbook.io/dkrcommands/useful-information/error-messages-customization");
        if (testServers)
            this._testServers = (typeof testServers === "string") ? [testServers] : testServers;
        if (botOwners)
            this._botOwners = (typeof botOwners === "string") ? [botOwners] : botOwners;
        this._commandHandler = new handlers_1.CommandHandler(this, client, this._commandsDir || "", this.typeScript);
        this._slashCommands = new handlers_1.SlashCommands(this, true);
        this._eventHandler = new handlers_1.EventHandler(this, this._client, this.eventsDir || "", this.typeScript);
        if (this.plugins) {
            for (const [index, plugin] of this.plugins.entries()) {
                if (!(plugin instanceof interfaces_1.Plugin))
                    throw new Error(`DKRCommands > Plugin at index ${index} does not extend Plugin.`);
                plugin.load(this);
            }
        }
        console.log("DKRCommands > Your bot is now running.");
    }
    async getLanguage(guild) {
        let language;
        if (this.isDBConnected()) {
            if (this.databaseBackwardCompatibility)
                language = (await models_1.LanguageModel.findOne({ _id: guild?.id }))?.language;
            else
                language = (await models_1.GuildModel.findOne({ server: guild?.id }))?.language;
        }
        return language || "english";
    }
    async setLanguage(guild, newLanguage) {
        let language;
        if (this.isDBConnected()) {
            if (this.databaseBackwardCompatibility)
                language = (await models_1.LanguageModel.findOneAndUpdate({ _id: guild.id }, { language: newLanguage }, { new: true }))?.language;
            else
                language = (await models_1.GuildModel.findOneAndUpdate({ server: guild.id }, { language: newLanguage }, { new: true }))?.language;
        }
        else
            throw new Error("No MongoDB connection established.");
        return language || "english";
    }
    async getPrefix(guild) {
        let prefix;
        if (this.isDBConnected()) {
            if (this.databaseBackwardCompatibility)
                prefix = (await models_1.PrefixModel.findOne({ _id: guild?.id }))?.prefix;
            else
                prefix = (await models_1.GuildModel.findOne({ server: guild?.id }))?.prefix;
        }
        return prefix || this.prefix || "!";
    }
    async setPrefix(guild, newPrefix) {
        let prefix;
        if (this.isDBConnected()) {
            if (this.databaseBackwardCompatibility)
                prefix = (await models_1.PrefixModel.findOneAndUpdate({ _id: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;
            else
                prefix = (await models_1.GuildModel.findOneAndUpdate({ server: guild.id }, { prefix: newPrefix }, { new: true }))?.prefix;
        }
        else
            throw new Error("No MongoDB connection established.");
        return prefix || this.prefix || "!";
    }
    isDBConnected() {
        return this._mongooseConnection?.readyState === mongoose_1.ConnectionStates.connected;
    }
    get client() {
        return this._client;
    }
    get showWarns() {
        return this._showWarns || false;
    }
    get errorMessages() {
        if (typeof this._errorMessages === "boolean")
            return this._errorMessages;
        else
            return true;
    }
    get ignoreBots() {
        return this._ignoreBots || false;
    }
    get ephemeral() {
        return this._ephemeral || false;
    }
    get testServers() {
        return this._testServers || [];
    }
    get botOwners() {
        return this._botOwners || [];
    }
    get databaseBackwardCompatibility() {
        return this._databaseBackwardCompatibility || false;
    }
    get mongooseConnection() {
        return this._mongooseConnection;
    }
    get commandHandler() {
        return this._commandHandler || new handlers_1.CommandHandler(this, this._client, this._commandsDir || "", this.typeScript);
    }
    get slashCommands() {
        return this._slashCommands || new handlers_1.SlashCommands(this, true);
    }
    get eventHandler() {
        return this._eventHandler || new handlers_1.EventHandler(this, this._client, this.eventsDir || "", this.typeScript);
    }
    get djsVersion() {
        return discord_js_1.version;
    }
}
exports.DKRCommands = DKRCommands;
