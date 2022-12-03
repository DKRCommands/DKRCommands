import { ApplicationCommand, ApplicationCommandOptionData, ChatInputCommandInteraction, Collection, Snowflake } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "./Command";
export declare class SlashCommands {
    private readonly client;
    private readonly instance;
    constructor(instance: DKRCommands, listen: boolean);
    private checkAndSetup;
    invokeCommand(interaction: ChatInputCommandInteraction, command: Command): Promise<void>;
    create(name: string, description: string, options: ApplicationCommandOptionData[], guildId?: string): Promise<ApplicationCommand | undefined>;
    private didOptionsChange;
    private checkAndDelete;
    getCommands(guild?: Snowflake): Promise<Collection<string, ApplicationCommand> | undefined>;
    deleteCommand(id: Snowflake, guild?: Snowflake): Promise<ApplicationCommand | undefined>;
}
