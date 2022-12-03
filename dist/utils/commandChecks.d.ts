import { CategoryChannel, DMChannel, ForumChannel, Guild, GuildMember, NewsChannel, PartialDMChannel, PrivateThreadChannel, PublicThreadChannel, StageChannel, TextChannel, User, VoiceChannel } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "../handlers";
declare function abilityToRunCommand(instance: DKRCommands, command: Command, guild: Guild | null, channel: CategoryChannel | NewsChannel | ForumChannel | StageChannel | TextChannel | PublicThreadChannel | PrivateThreadChannel | VoiceChannel | DMChannel | PartialDMChannel | null, member: GuildMember | null, user: User, send: (reply: string | object) => void): Promise<boolean>;
export { abilityToRunCommand };
