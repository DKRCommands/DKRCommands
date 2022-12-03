import { ApplicationCommandOptionData, ApplicationCommandSubCommandData, ChatInputCommandInteraction, Client, Guild, GuildMember, Message, TextChannel, User } from "discord.js";
import { DKRCommands } from "../index";
interface ICommand {
    name?: string;
    aliases?: string[] | string;
    description: string;
    permissions?: bigint[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    requiresVoice?: boolean;
    requiresSameVoice?: boolean;
    testOnly?: boolean;
    slash?: boolean | "both";
    options?: (ApplicationCommandOptionData & {
        options?: ApplicationCommandSubCommandData[];
    })[];
    globalCooldown?: number;
    guildCooldown?: number;
    userCooldown?: number;
    init?(client: Client, instance: DKRCommands): void;
    callback?(obj: ICallbackObject): void | string | object;
}
interface ICallbackObject {
    instance: DKRCommands;
    client: Client;
    interaction?: ChatInputCommandInteraction;
    message?: Message;
    guild: Guild | null;
    member: GuildMember;
    channel: TextChannel;
    prefix?: string;
    content?: string;
    user: User;
}
interface CommandCheckObject {
    name: string;
    slash: boolean | "both";
    testOnly: boolean;
}
export { ICommand, ICallbackObject, CommandCheckObject };
