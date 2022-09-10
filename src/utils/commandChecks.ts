import {
    CategoryChannel, DMChannel,
    Guild,
    GuildMember,
    NewsChannel, PartialDMChannel, PermissionsBitField, PrivateThreadChannel, PublicThreadChannel, Snowflake,
    StageChannel,
    TextChannel,
    User, VoiceChannel
} from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "../handlers";

/**
 * Checks whether all the requirements of the given command are met.
 * @param instance - DKRCommands instance
 * @param command - DKRCommands command instance
 * @param guild - Discord guild
 * @param channel - Discord channel
 * @param member - Discord member
 * @param user - Discord user
 * @param send - send callback
 */
async function abilityToRunCommand(instance: DKRCommands, command: Command, guild: Guild | null, channel: CategoryChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | DMChannel | PartialDMChannel | null, member: GuildMember | null, user: User, send: (reply: string | object) => void): Promise<boolean> {
    return !(
        (!isEnabled(instance, guild, await command.isEnabled(guild), send)) ||
        (command.slash !== true && command.testOnly && !checkTestOnly(instance, guild)) ||
        (command.ownerOnly && !checkOwnerOnly(instance, guild, user, send)) ||
        (command.guildOnly && !checkGuildOnly(instance, guild, send)) ||
        ((await command.getAllowedChannels(guild)).length > 0 && !checkAllowedChannels(instance, guild, channel, await command.getAllowedChannels(guild), send)) ||
        (command.permissions.length > 0 && !checkRequiredPermissions(instance, guild, member, command.permissions, send)) ||
        ((await command.getRequiredRoles(guild)).length > 0 && !checkRequiredRoles(instance, guild, member, await command.getRequiredRoles(guild), send)) ||
        (command.requiresVoice && !checkVoice(instance, guild, member, send)) ||
        (command.requiresSameVoice && !checkSameVoice(instance, guild, member, send))
    );
}

/**
 * Checks whether the given command is allowed or not.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param enabled - whether the command is enabled or not
 * @param send - send callback
 */
function isEnabled(instance: DKRCommands, guild: Guild | null, enabled: boolean, send: (reply: (string | object)) => void): boolean {
    if (guild?.id)
        if (!enabled) {
            if (instance.errorMessages)
                send("This command is disabled.");
            instance.emit("commandDisabled", instance, guild, send);

            return false;
        }

    return true;
}

/**
 * Checks if the testOnly command is run only from an enabled test server (only for legacy commands).
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 */
function checkTestOnly(instance: DKRCommands, guild: Guild | null): boolean {
    return !(!guild || !instance.testServers.includes(guild.id));
}

/**
 * Checks if the ownerOnly command is run only by an authorized user.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param user - Discord user
 * @param send - send callback
 */
function checkOwnerOnly(instance: DKRCommands, guild: Guild | null, user: User, send: (reply: string | object) => void): boolean {
    if (!instance.botOwners.includes(user.id)) {
        if (instance.errorMessages)
            send("Only the bot owner can run this command.");
        instance.emit("commandOwnerOnly", instance, guild, send);

        return false;
    } else
        return true;
}

/**
 * Checks if the guildOnly command is run only from the server.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param send - send callback
 */
function checkGuildOnly(instance: DKRCommands, guild: Guild | null, send: (reply: string | object) => void): boolean {
    if (!guild) {
        if (instance.errorMessages)
            send("This command can only be used within a server.");
        instance.emit("commandGuildOnly", instance, send);

        return false;
    } else
        return true;
}

/**
 * Checks whether the given command is allowed to be used in this channel.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param commandChannel - Discord channel
 * @param channels - Allowed channels for command
 * @param send - send callback
 */
function checkAllowedChannels(instance: DKRCommands, guild: Guild | null, commandChannel: CategoryChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | DMChannel | PartialDMChannel | null, channels: string[], send: (reply: (string | object)) => void): boolean {
    if (guild?.id)
        for (const channel of channels) {
            const guildChannel = guild?.channels.cache.get(channel);
            if (guildChannel && commandChannel?.id !== guildChannel.id) {
                if (instance.errorMessages)
                    send("This command cannot be used in this channel.");
                instance.emit("commandDisallowedChannel", instance, guild, send);

                return false;
            }
        }

    return true;
}

/**
 * Checks if the user has the required permissions.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param member - Discord member
 * @param permissions - Required permissions for command
 * @param send - send callback
 */
function checkRequiredPermissions(instance: DKRCommands, guild: Guild | null, member: GuildMember | null, permissions: bigint[], send: (reply: string | object) => void): boolean {
    if (guild?.id)
        for (const perm of permissions) {
            const permission = new PermissionsBitField(perm);
            if (!member?.permissions.has(permission)) {
                if (instance.errorMessages)
                    send(`You must have the **${permission.toArray()}** permission in order to use this command.`);
                instance.emit("commandMissingPermission", instance, guild, permission.toArray().toString(), send);

                return false;
            }
        }

    return true;
}

/**
 * Checks if the user has the required roles.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param member - Discord member
 * @param roles - Required roles for command
 * @param send - send callback
 */
function checkRequiredRoles(instance: DKRCommands, guild: Guild | null, member: GuildMember | null, roles: Snowflake[], send: (reply: string | object) => void): boolean {
    if (guild?.id)
        for (const role of roles) {
            const guildRole = guild?.roles.cache.get(role);
            if (guildRole && !member?.roles.cache.has(guildRole.id)) {
                if (instance.errorMessages)
                    send(`You must have the **${guildRole.name}** role in order to use this command.`);
                instance.emit("commandMissingRole", instance, guild, guildRole.name, send);

                return false;
            }
        }

    return true;
}

/**
 * Checks whether the user is connected to a voice channel.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param member - Discord member
 * @param send - send callback
 */
function checkVoice(instance: DKRCommands, guild: Guild | null, member: GuildMember | null, send: (reply: (string | object)) => void): boolean {
    if (guild?.id)
        if (!member?.voice.channel) {
            if (instance.errorMessages)
                send("This command can only be used if you are connected to a voice channel.");
            instance.emit("commandRequiresVoice", instance, guild, send);

            return false;
        }

    return true;
}

/**
 * Checks whether the user is connected to the same voice channel as the bot.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param member - Discord member
 * @param send - send callback
 */
function checkSameVoice(instance: DKRCommands, guild: Guild | null, member: GuildMember | null, send: (reply: (string | object)) => void): boolean {
    if (guild?.id)
        if (member?.voice.channel?.id !== guild.members.me?.voice.channel?.id) {
            if (instance.errorMessages)
                send("This command can only be used if you are connected to the same voice channel as the bot.");
            instance.emit("commandRequiresSameVoice", instance, guild, send);

            return false;
        }

    return true;
}

export {
    abilityToRunCommand
};
