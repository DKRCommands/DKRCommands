import { isDeepStrictEqual } from "util";
import {
    ApplicationCommand, ApplicationCommandOption,
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client, Collection, Guild, GuildMember, InteractionResponse, Message, Snowflake, TextChannel
} from "discord.js";
import { DKRCommands } from "../index";
import { abilityToRunCommand } from "../utils";

/**
 * The class responsible for registering, editing and responding to slash commands.
 */
export class SlashCommands {
    private readonly client: Client;
    private readonly instance: DKRCommands;

    constructor(instance: DKRCommands, listen: boolean) {
        this.instance = instance;
        this.client = instance.client;

        this.checkAndSetup(listen).then();
    }

    /**
     * Registers a listener for the `interactionCreate` event and invokes the corresponding callback method.
     * @param listen - whether to listen to the `interactionCreate` event
     * @private
     */
    private async checkAndSetup(listen: boolean): Promise<void> {
        if (listen) {
            this.client.on("interactionCreate", async (interaction) => {
                if (!interaction.isChatInputCommand())
                    return;

                const { commandName, guild, user, channelId } = interaction;
                const member = interaction.member as GuildMember;
                const channel = guild?.channels.cache.get(channelId) || null;
                const command = this.instance.commandHandler.getCommand(commandName);
                if (!command) {
                    if (this.instance.errorMessages)
                        interaction.reply({
                            content: "This slash command is not properly registered.",
                            ephemeral: this.instance.ephemeral
                        }).then();
                    this.instance.emit("invalidSlashCommand", this.instance, guild, (reply: string | object) => {
                        if (typeof reply === "string")
                            interaction.reply({
                                content: reply,
                                ephemeral: this.instance.ephemeral
                            }).then();
                        else
                            interaction.reply({
                                ephemeral: this.instance.ephemeral,
                                ...reply
                            }).then();
                    });

                    return;
                }

                if (!await abilityToRunCommand(this.instance, command, guild, channel, member, user, (reply: string | object) => {
                    if (typeof reply === "string")
                        interaction.reply({
                            content: reply,
                            ephemeral: this.instance.ephemeral
                        }).then();
                    else
                        interaction.reply({
                            ephemeral: this.instance.ephemeral,
                            ...reply
                        }).then();
                }))
                    return;

                this.invokeCommand(interaction, commandName).then();
            });
        }
    }

    /**
     * Calls the callback method of the slash command.
     * @param interaction - Discord interaction
     * @param commandName - name of the called command
     * @private
     */
    private async invokeCommand(interaction: ChatInputCommandInteraction, commandName: string): Promise<void> {
        const command = this.instance.commandHandler.getCommand(commandName);
        if (!command || !command.callback)
            return;

        const reply = await command.callback({
            instance: this.instance,
            client: this.client,
            interaction,
            guild: interaction.guild,
            member: interaction.member as GuildMember,
            channel: interaction.channel as TextChannel,
            user: interaction.user
        });

        if (reply && !(reply instanceof InteractionResponse) && !(reply instanceof Message)) {
            if (typeof reply === "string")
                interaction.reply({
                    content: reply,
                }).then();
            else if (typeof reply === "object")
                interaction.reply(reply).then();
        }
    }

    /**
     * Creates (or modifies) a slash command.
     * @param name - command name
     * @param description - command description
     * @param options - command options
     * @param guildId - Discord server ID
     */
    public async create(name: string, description: string, options: ApplicationCommandOptionData[], guildId?: string): Promise<ApplicationCommand | undefined> {
        let commands;
        if (guildId)
            commands = this.client.guilds.cache.get(guildId)?.commands;
        else
            commands = this.client.application?.commands;

        if (!commands)
            return;

        await commands.fetch({});

        const cmd = commands.cache.find((cmd) => cmd.name === name) as ApplicationCommand;
        if (cmd) {
            const optionsChanged = this.didOptionsChange(cmd, options);
            if (cmd.description !== description || cmd.options.length !== options.length || optionsChanged) {
                console.log(`DKRCommands > Updating${guildId ? " guild" : ""} slash command "${name}"`);

                return commands?.edit(cmd.id, { name, description, options });
            }

            return cmd;
        }
        if (commands) {
            console.log(`DKRCommands > Creating${guildId ? " guild" : ""} slash command "${name}"`);

            return await commands.create({ name, description, options });
        }
    }

    /**
     * Checks if the options of the given slash command have changed.
     * @param command - existing command
     * @param options - new command options
     * @private
     */
    private didOptionsChange(command: ApplicationCommand, options: (ApplicationCommandOptionData & { required?: boolean })[]): boolean {
        return (command.options?.filter((opt: ApplicationCommandOption & { nameLocalized?: string | undefined, descriptionLocalized?: string | undefined, required?: boolean, options?: ApplicationCommandOptionData[] }, index) => {
            return !isDeepStrictEqual(JSON.parse(JSON.stringify(opt)), options[index]);
        }).length !== 0);
    }

    /**
     * Returns a list of slash commands for the specified server or for the entire bot.
     * @param guild - Discord guild
     */
    public async getCommands(guild?: Guild): Promise<Collection<string, ApplicationCommand> | undefined> {
        let commands;
        if (guild?.id)
            commands = this.client.guilds.cache.get(guild.id)?.commands;
        else
            commands = this.client.application?.commands;

        await commands?.fetch({});
        return commands?.cache;
    }

    /**
     * Deletes the slash command according to the specified ID.
     * @param id - command id
     * @param guild - Discord guild
     */
    public async deleteCommand(id: Snowflake, guild?: Guild): Promise<ApplicationCommand | undefined> {
        const commands = await this.getCommands(guild);
        const command = commands?.get(id);
        if (command) {
            console.log(`DKRCommands > Deleting${guild ? " guild" : ""} slash command "${command.name}"`);

            command.delete().then();
        }

        return command;
    }
}
