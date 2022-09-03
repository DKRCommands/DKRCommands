import {
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client,
    CommandInteractionOptionResolver, Guild,
    GuildMember,
    Message, TextChannel,
    User
} from "discord.js";
import { DKRCommands } from "../index";

interface ICallbackObject {
    instance: DKRCommands;
    client: Client;
    interaction?: ChatInputCommandInteraction;
    message?: Message;
    guild: Guild | null;
    member: GuildMember;
    channel: TextChannel;
    prefix?: string;
    args: string[];
    text: string;
    options?: Omit<CommandInteractionOptionResolver, "getMessage" | "getFocused">;
    user: User;
}

interface IErrorObject {
    command: string;
    message: Message;
    info: object;
}

interface ICommand {
    aliases?: string[] | string;
    description: string;
    permissions?: bigint[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    testOnly?: boolean;
    slash?: boolean | "both";
    options?: ApplicationCommandOptionData[];

    init?(client: Client, instance: DKRCommands): void;

    callback?(obj: ICallbackObject): void;

    error?(obj: IErrorObject): void;
}

interface Options {
    commandsDir: string;
    showWarns?: boolean;
    ignoreBots?: boolean;
    testServers?: string | string[];
    botOwners?: string | string[];
    ephemeral?: boolean;
    debug?: boolean;
    typescript?: boolean;
}

export {
    ICallbackObject,
    IErrorObject,
    ICommand,
    Options
};
