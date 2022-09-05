import { isDeepStrictEqual } from "util";
import {
    ApplicationCommand,
    ApplicationCommandOption,
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client,
    CommandInteractionOptionResolver, GuildMember, InteractionResponse, Message, TextChannel
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
            this.client.on("interactionCreate", (interaction) => {
                if (!interaction.isChatInputCommand())
                    return;

                const { commandName, guild, user, channelId, options } = interaction;
                const member = interaction.member as GuildMember;
                const channel = guild?.channels.cache.get(channelId) || null;
                const command = this.instance.commandHandler.getCommand(commandName);
                if (!command) {
                    if (this.instance.errorMessages)
                        interaction.reply({
                            content: "This slash command is not properly registered.",
                            ephemeral: this.instance.ephemeral
                        }).then();
                    this.instance.emit("invalidSlashCommand", this.instance, guild, (content: string) => {
                        interaction.reply({
                            content,
                            ephemeral: this.instance.ephemeral
                        }).then();
                    });

                    return;
                }

                const args: string[] = [];
                options.data.forEach(({ value }) => {
                    args.push(String(value));
                });

                if (!abilityToRunCommand(this.instance, command, guild, channel, member, user, (content) => {
                    interaction.reply({
                        content,
                        ephemeral: this.instance.ephemeral
                    }).then();
                }))
                    return;

                this.invokeCommand(interaction, commandName, options, args).then();
            });
        }
    }

    /**
     * Calls the callback method of the slash command.
     * @param interaction - Discord interaction
     * @param commandName - name of the called command
     * @param options - command options
     * @param args - command arguments
     * @private
     */
    private async invokeCommand(interaction: ChatInputCommandInteraction, commandName: string, options: Omit<CommandInteractionOptionResolver, "getMessage" | "getFocused">, args: string[]): Promise<void> {
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
            args,
            text: args.join(" "),
            options,
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
}
