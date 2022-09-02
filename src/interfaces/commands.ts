import {
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client,
    CommandInteractionOptionResolver,
    Guild,
    GuildMember,
    Message,
    TextChannel,
    User
} from "discord.js";
import { DJSCommands } from "../index";

interface ICallbackObject {
    member: GuildMember;
    guild: Guild | null;
    channel: TextChannel;
    args: string[];
    text: string;
    client: Client;
    instance: DJSCommands;
    interaction: ChatInputCommandInteraction;
    options: Omit<CommandInteractionOptionResolver, "getMessage" | "getFocused">;
    user: User;
}

interface IErrorObject {
    command: string;
    message: Message;
    info: object;
}

interface ICommand {
    names?: string[] | string;
    category: string;
    description: string;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    testOnly?: boolean;
    slash?: boolean;
    options?: ApplicationCommandOptionData[];

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
