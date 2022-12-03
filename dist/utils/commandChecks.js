"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abilityToRunCommand = void 0;
const discord_js_1 = require("discord.js");
async function abilityToRunCommand(instance, command, guild, channel, member, user, send) {
    return !((!isEnabled(instance, guild, await command.isEnabled(guild), send)) ||
        (command.slash !== true && command.testOnly && !checkTestOnly(instance, guild)) ||
        (command.ownerOnly && !checkOwnerOnly(instance, guild, user, send)) ||
        (command.guildOnly && !checkGuildOnly(instance, guild, send)) ||
        ((await command.getAllowedChannels(guild)).length > 0 && !checkAllowedChannels(instance, guild, channel, await command.getAllowedChannels(guild), send)) ||
        (command.permissions.length > 0 && !checkRequiredPermissions(instance, guild, member, command.permissions, send)) ||
        ((await command.getRequiredRoles(guild)).length > 0 && !checkRequiredRoles(instance, guild, member, await command.getRequiredRoles(guild), send)) ||
        (command.requiresVoice && !checkVoice(instance, guild, member, send)) ||
        (command.requiresSameVoice && !checkSameVoice(instance, guild, member, send)));
}
exports.abilityToRunCommand = abilityToRunCommand;
function isEnabled(instance, guild, enabled, send) {
    if (guild?.id)
        if (!enabled) {
            if (instance.errorMessages)
                send("This command is disabled.");
            instance.emit("commandDisabled", instance, guild, send);
            return false;
        }
    return true;
}
function checkTestOnly(instance, guild) {
    return !(!guild || !instance.testServers.includes(guild.id));
}
function checkOwnerOnly(instance, guild, user, send) {
    if (!instance.botOwners.includes(user.id)) {
        if (instance.errorMessages)
            send("Only the bot owner can run this command.");
        instance.emit("commandOwnerOnly", instance, guild, send);
        return false;
    }
    else
        return true;
}
function checkGuildOnly(instance, guild, send) {
    if (!guild) {
        if (instance.errorMessages)
            send("This command can only be used within a server.");
        instance.emit("commandGuildOnly", instance, send);
        return false;
    }
    else
        return true;
}
function checkAllowedChannels(instance, guild, commandChannel, channels, send) {
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
function checkRequiredPermissions(instance, guild, member, permissions, send) {
    if (guild?.id)
        for (const perm of permissions) {
            const permission = new discord_js_1.PermissionsBitField(perm);
            if (!member?.permissions.has(permission)) {
                if (instance.errorMessages)
                    send(`You must have the **${permission.toArray()}** permission in order to use this command.`);
                instance.emit("commandMissingPermission", instance, guild, permission.toArray().toString(), send);
                return false;
            }
        }
    return true;
}
function checkRequiredRoles(instance, guild, member, roles, send) {
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
function checkVoice(instance, guild, member, send) {
    if (guild?.id)
        if (!member?.voice.channel) {
            if (instance.errorMessages)
                send("This command can only be used if you are connected to a voice channel.");
            instance.emit("commandRequiresVoice", instance, guild, send);
            return false;
        }
    return true;
}
function checkSameVoice(instance, guild, member, send) {
    if (guild?.id)
        if (member?.voice.channel?.id !== guild.members.me?.voice.channel?.id) {
            if (instance.errorMessages)
                send("This command can only be used if you are connected to the same voice channel as the bot.");
            instance.emit("commandRequiresSameVoice", instance, guild, send);
            return false;
        }
    return true;
}
