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
    // Only for legacy commands
    names?: string[] | string;
    // Require for built-in help command
    category: string;
    description: string;
    // Required custom check
    ownerOnly?: boolean;
    // Required custom check
    guildOnly?: boolean;
    testOnly?: boolean;
    slash?: boolean | "both";
    options?: ApplicationCommandOptionData[];

    callback?(obj: ICallbackObject): void;

    error?(obj: IErrorObject): void;
}

interface Options {
    commandsDir: string;
    showWarns?: boolean;
    // Only for legacy commands
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
