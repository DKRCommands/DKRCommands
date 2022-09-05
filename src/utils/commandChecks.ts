import {
    CategoryChannel, DMChannel,
    Guild,
    GuildMember,
    NewsChannel, PartialDMChannel, PermissionsBitField, PrivateThreadChannel, PublicThreadChannel,
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
function abilityToRunCommand(instance: DKRCommands, command: Command, guild: Guild | null, channel: CategoryChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | DMChannel | PartialDMChannel | null, member: GuildMember | null, user: User, send: (reply: string | object) => void): boolean {
    return !(
        (command.guildOnly && !checkGuildOnly(instance, guild, send)) ||
        (command.slash !== true && command.testOnly && !checkTestOnly(instance, guild)) ||
        (command.ownerOnly && !checkOwnerOnly(instance, guild, user, send)) ||
        (command.permissions.length > 0 && !checkRequiredPermissions(instance, guild, member, command.permissions, send))
    );
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
 * Checks if the user has the required permissions.
 * @param instance - DKRCommands instance
 * @param guild - Discord guild
 * @param member - Discord member
 * @param permissions - Required permissions for command
 * @param send - send callback
 */
function checkRequiredPermissions(instance: DKRCommands, guild: Guild | null, member: GuildMember | null, permissions: bigint[] | undefined, send: (reply: string | object) => void): boolean {
    for (const perm of permissions || []) {
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

export {
    abilityToRunCommand
};
