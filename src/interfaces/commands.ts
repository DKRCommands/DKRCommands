import {
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client,
    Guild,
    GuildMember,
    Message, TextChannel,
    User
} from "discord.js";
import { DKRCommands } from "../index";
import { ConnectOptions } from "mongoose";

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

interface ICommand {
    name?: string;
    aliases?: string[] | string;
    description: string;
    permissions?: bigint[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    testOnly?: boolean;
    slash?: boolean | "both";
    options?: ApplicationCommandOptionData[];

    init?(client: Client, instance: DKRCommands): void;

    callback?(obj: ICallbackObject): void | string | object;
}

interface Options {
    commandsDir: string;
    prefix?: string;
    showWarns?: boolean;
    errorMessages?: boolean;
    ignoreBots?: boolean;
    testServers?: string | string[];
    botOwners?: string | string[];
    ephemeral?: boolean;
    debug?: boolean;
    typescript?: boolean;
    mongoUri?: string;
    dbOptions?: ConnectOptions;
    databaseBackwardCompatibility?: boolean;
}

export {
    ICallbackObject,
    ICommand,
    Options
};
