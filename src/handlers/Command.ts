import { Client, Guild, GuildMember, Message, MessageReaction, Snowflake, TextChannel } from "discord.js";
import { DKRCommands } from "../index";
import { ICallbackObject, ICommand } from "../interfaces";
import { ChannelCommandModel, DisabledCommandModel, GuildCommandModel, RequiredRoleModel } from "../database/models";

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
    private readonly _requiresVoice: boolean;
    private readonly _requiresSameVoice: boolean;
    private readonly _testOnly: boolean;
    private readonly _slash: boolean | "both";

    public callback: (obj: ICallbackObject) => void | string | object;

    constructor(instance: DKRCommands, client: Client, names: string[], callback: (obj: ICallbackObject) => void | string | object, {
        description,
        permissions,
        ownerOnly = false,
        guildOnly = false,
        requiresVoice = false,
        requiresSameVoice = false,
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
        this._requiresVoice = requiresVoice;
        this._requiresSameVoice = requiresSameVoice;
        this._testOnly = testOnly;
        this._slash = slash;
        this.callback = callback;
    }

    /**
     * Calls the callback method of the legacy command.
     * @param message - Discord message
     * @param content - command message content without prefix and command name
     */
    public async execute(message: Message, content: string): Promise<void> {
        const reply = await this.callback({
            instance: this._instance,
            client: this._client,
            message,
            guild: message.guild,
            member: message.member as GuildMember,
            channel: message.channel as TextChannel,
            prefix: await this._instance.getPrefix(message.guild),
            content,
            user: message.author
        });

        if (reply && !(reply instanceof Message) && !(reply instanceof MessageReaction)) {
            if (typeof reply === "string")
                message.reply({
                    content: reply,
                }).then();
            else if (typeof reply === "object")
                message.reply(reply).then();
        }
    }

    /**
     * Returns whether the given command is allowed or not.
     * @param guild - Discord guild
     */
    public async isEnabled(guild: Guild | null): Promise<boolean> {
        let enabled;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility)
                enabled = (await DisabledCommandModel.countDocuments({
                    guildId: guild?.id,
                    command: this._names[0]
                })) === 0;
            // Use DKRCommands database schema
            else
                enabled = (await GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.enabled;
        }

        if (typeof enabled === "boolean")
            return enabled;
        else
            return true;
    }

    /**
     * Enables or disables the given command for the given server.
     * @param guild - Discord guild
     * @param newEnabled - whether the given command is allowed or not
     */
    public async setEnabled(guild: Guild | null, newEnabled: boolean): Promise<boolean> {
        let enabled;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility) {
                if (!newEnabled) {
                    await DisabledCommandModel.updateOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        guildId: guild?.id,
                        command: this._names[0]
                    }, {
                        upsert: true
                    });
                } else
                    await DisabledCommandModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0]
                    });

                enabled = newEnabled;
            }
            // Use DKRCommands database schema
            else
                enabled = (await GuildCommandModel.findOneAndUpdate({
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
        } else
            throw new Error("No MongoDB connection established.");

        if (typeof enabled === "boolean")
            return enabled;
        else
            return true;
    }

    /**
     * Returns the list of allowed channels for the given command for the given server.
     * @param guild - Discord guild
     */
    public async getAllowedChannels(guild: Guild | null): Promise<Snowflake[]> {
        let channels;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility)
                channels = (await ChannelCommandModel.findOne({
                    guildId: guild?.id,
                    command: this._names[0]
                }))?.channels;
            // Use DKRCommands database schema
            else
                channels = (await GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.allowedChannels;
        }

        return channels || [];
    }

    /**
     * Sets the allowed channels for the given command for the given server.
     * @param guild - Discord guild
     * @param allowedChannels - list of allowed channels
     */
    public async setAllowedChannels(guild: Guild | null, allowedChannels: Snowflake[]): Promise<Snowflake[]> {
        let channels;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility) {
                if (!allowedChannels.length)
                    await ChannelCommandModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0],
                    });
                else {
                    await ChannelCommandModel.updateOne({
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
            // Use DKRCommands database schema
            else
                channels = (await GuildCommandModel.findOneAndUpdate({
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
        } else
            throw new Error("No MongoDB connection established.");

        return channels || [];
    }

    /**
     * Returns the list of required roles for the given command for the given server.
     * @param guild - Discord guild
     */
    public async getRequiredRoles(guild: Guild | null): Promise<Snowflake[]> {
        let roles;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility)
                roles = (await RequiredRoleModel.findOne({
                    guildId: guild?.id,
                    command: this._names[0]
                }))?.requiredRoles;
            // Use DKRCommands database schema
            else
                roles = (await GuildCommandModel.findOne({
                    server: guild?.id,
                    command: this._names[0]
                }))?.requiredRoles;
        }

        return roles || [];
    }

    /**
     * Sets the required roles for the given command for the given server.
     * @param guild - Discord guild
     * @param requiredRoles - list of required roles
     */
    public async setRequiredRoles(guild: Guild | null, requiredRoles: Snowflake[]): Promise<Snowflake[]> {
        let roles;
        if (this._instance.isDBConnected()) {
            // Use WOKCommands database schema
            if (this._instance.databaseBackwardCompatibility) {
                if (!requiredRoles.length)
                    await RequiredRoleModel.deleteOne({
                        guildId: guild?.id,
                        command: this._names[0],
                    });
                else {
                    await RequiredRoleModel.updateOne({
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
            // Use DKRCommands database schema
            else
                roles = (await GuildCommandModel.findOneAndUpdate({
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
        } else
            throw new Error("No MongoDB connection established.");

        return roles || [];
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

    get requiresVoice(): boolean {
        return this._requiresVoice;
    }

    get requiresSameVoice(): boolean {
        return this._requiresSameVoice;
    }

    get testOnly(): boolean {
        return this._testOnly;
    }

    get slash(): boolean | "both" {
        return this._slash;
    }
}
