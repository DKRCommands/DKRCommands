import {
    CategoryChannel, DMChannel,
    Guild,
    GuildMember,
    NewsChannel, PartialDMChannel, PrivateThreadChannel, PublicThreadChannel,
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
function abilityToRunCommand(instance: DKRCommands, command: Command, guild: Guild | null, channel: CategoryChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | DMChannel | PartialDMChannel | null, member: GuildMember | null, user: User, send: (message: string) => void): boolean {
    return !(
        (command.guildOnly && !checkGuildOnly(guild, send)) ||
        (command.slash !== true && command.testOnly && !checkTestOnly(instance, guild)) ||
        (command.ownerOnly && !checkOwnerOnly(instance, user, send))
    );
}

/**
 * Checks if the guildOnly command is run only from the server.
 * @param guild - Discord guild
 * @param send - send callback
 */
function checkGuildOnly(guild: Guild | null, send: (message: string) => void): boolean {
    if (!guild) {
        send("This command can only be used within a server.");

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
 * @param user - Discord user
 * @param send - send callback
 */
function checkOwnerOnly(instance: DKRCommands, user: User, send: (message: string) => void): boolean {
    if (!instance.botOwners.includes(user.id)) {
        send("Only the bot owner can run this command.");

        return false;
    } else
        return true;
}

export {
    abilityToRunCommand
};
