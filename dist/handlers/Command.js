"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const discord_js_1 = require("discord.js");
const models_1 = require("../database/models");
class Command {
    _instance;
    _client;
    _names;
    _description;
    _permissions;
    _ownerOnly;
    _guildOnly;
    _requiresVoice;
    _requiresSameVoice;
    _testOnly;
    _slash;
    _globalCooldown;
    _guildCooldown;
    _userCooldown;
    callback;
    constructor(instance, client, names, callback, { description, permissions, ownerOnly = false, guildOnly = false, requiresVoice = false, requiresSameVoice = false, testOnly = false, slash = false, globalCooldown, guildCooldown, userCooldown }) {
        this._instance = instance;
        this._client = client;
        this._names = names;
        this._description = description;
        this._permissions = permissions;
        this._ownerOnly = ownerOnly;
        this._guildOnly = guildOnly;
        this._requiresVoice = requiresVoice;
        this._requiresSameVoice = requiresSameVoice;
        this._testOnly = testOnly;
        this._slash = slash;
        this._globalCooldown = globalCooldown;
        this._guildCooldown = guildCooldown;
        this._userCooldown = userCooldown;
        this.callback = callback;
    }
    async execute(message, content) {
        const reply = await this.callback({
            instance: this._instance,
            client: this._client,
            message,
            guild: message.guild,
            member: message.member,
            channel: message.channel,
            prefix: await this._instance.getPrefix(message.guild),
            content,
            user: message.author
        });
        if (reply && !(reply instanceof discord_js_1.Message) && !(reply instanceof discord_js_1.MessageReaction)) {
            if (typeof reply === "string")
                message.reply({
                    content: reply,
                }).then();
            else if (typeof reply === "object")
                message.reply(reply).then();
        }
    }
    async isEnabled(guild) {
        let enabled;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility)
                enabled = (await models_1.DisabledCommandModel.countDocuments({
                    guildId: guild?.id,
                    command: this._names[0]
                })) === 0;
            else
                enabled = (await models_1.GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.enabled;
        }
        if (typeof enabled === "boolean")
            return enabled;
        else
            return true;
    }
    async setEnabled(guild, newEnabled) {
        let enabled;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility) {
                if (!newEnabled) {
                    await models_1.DisabledCommandModel.updateOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        upsert: true
                    });
                }
                else
                    await models_1.DisabledCommandModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    });
                enabled = newEnabled;
            }
            else
                enabled = (await models_1.GuildCommandModel.findOneAndUpdate({
                    server: guild?.id,
                    command: this._names[0]
                }, {
                    server: guild?.id,
                    command: this._names[0],
                    enabled: newEnabled
                }, {
                    upsert: true,
                    new: true
                }))?.enabled;
        }
        else
            throw new Error("No MongoDB connection established.");
        if (typeof enabled === "boolean")
            return enabled;
        else
            return true;
    }
    async getAllowedChannels(guild) {
        let channels;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility)
                channels = (await models_1.ChannelCommandModel.findOne({
                    guildId: guild?.id,
                    command: this._names[0]
                }))?.channels;
            else
                channels = (await models_1.GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.allowedChannels;
        }
        return channels || [];
    }
    async setAllowedChannels(guild, allowedChannels) {
        let channels;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility) {
                if (!allowedChannels.length)
                    await models_1.ChannelCommandModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0],
                    });
                else {
                    await models_1.ChannelCommandModel.updateOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        guildId: guild?.id,
                        command: this._names[0],
                        channels: allowedChannels
                    }, {
                        upsert: true
                    });
                    channels = allowedChannels;
                }
            }
            else
                channels = (await models_1.GuildCommandModel.findOneAndUpdate({
                    server: guild?.id,
                    command: this._names[0]
                }, {
                    server: guild?.id,
                    command: this._names[0],
                    allowedChannels
                }, {
                    upsert: true,
                    new: true
                }))?.allowedChannels;
        }
        else
            throw new Error("No MongoDB connection established.");
        return channels || [];
    }
    async getRequiredRoles(guild) {
        let roles;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility)
                roles = (await models_1.RequiredRoleModel.findOne({
                    guildId: guild?.id,
                    command: this._names[0]
                }))?.requiredRoles;
            else
                roles = (await models_1.GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.requiredRoles;
        }
        return roles || [];
    }
    async setRequiredRoles(guild, requiredRoles) {
        let roles;
        if (this._instance.isDBConnected()) {
            if (this._instance.databaseBackwardCompatibility) {
                if (!requiredRoles.length)
                    await models_1.RequiredRoleModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0],
                    });
                else {
                    await models_1.RequiredRoleModel.updateOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        guildId: guild?.id,
                        command: this._names[0],
                        requiredRoles
                    }, {
                        upsert: true
                    });
                    roles = requiredRoles;
                }
            }
            else
                roles = (await models_1.GuildCommandModel.findOneAndUpdate({
                    server: guild?.id,
                    command: this._names[0]
                }, {
                    server: guild?.id,
                    command: this._names[0],
                    requiredRoles
                }, {
                    upsert: true,
                    new: true
                }))?.requiredRoles;
        }
        else
            throw new Error("No MongoDB connection established.");
        return roles || [];
    }
    get name() {
        return this._names[0] || "";
    }
    get permissions() {
        return this._permissions || [];
    }
    get ownerOnly() {
        return this._ownerOnly;
    }
    get guildOnly() {
        return this._guildOnly;
    }
    get requiresVoice() {
        return this._requiresVoice;
    }
    get requiresSameVoice() {
        return this._requiresSameVoice;
    }
    get testOnly() {
        return this._testOnly;
    }
    get slash() {
        return this._slash;
    }
    get globalCooldown() {
        return this._globalCooldown;
    }
    get guildCooldown() {
        return this._guildCooldown;
    }
    get userCooldown() {
        return this._userCooldown;
    }
}
exports.Command = Command;
