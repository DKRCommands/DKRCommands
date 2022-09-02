import {
    ApplicationCommand,
    ApplicationCommandOption,
    ApplicationCommandOptionData,
    ChatInputCommandInteraction,
    Client,
    CommandInteractionOptionResolver, GuildMember, TextChannel
} from "discord.js";
import { DJSCommands } from "../index";

/**
 * The class responsible for registering, editing and responding to slash commands.
 */
export class SlashCommands {
    private readonly client: Client;
    private readonly instance: DJSCommands;

    //private commandChecks: Map<String, Function> = new Map();

    constructor(instance: DJSCommands, listen: boolean) {
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

                const { commandName, options } = interaction;
                const command = this.instance.commandHandler.getCommand(commandName);
                if (!command)
                    return interaction.reply({
                        content: "This slash command is not properly registered.",
                        ephemeral: this.instance.ephemeral
                    }).then();

                const args: string[] = [];
                options.data.forEach(({ value }) => {
                    args.push(String(value));
                });

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

        await command.callback({
            member: interaction.member as GuildMember,
            guild: interaction.guild,
            channel: interaction.channel as TextChannel,
            args,
            text: args.join(" "),
            client: this.client,
            instance: this.instance,
            interaction,
            options,
            user: interaction.user,
        });
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
                console.log(`DJSCommands > Updating${guildId ? " guild" : ""} slash command "${name}"`);

                return commands?.edit(cmd.id, { name, description, options });
            }

            return cmd;
        }
        if (commands) {
            console.log(`DJSCommands > Creating${guildId ? " guild" : ""} slash command "${name}"`);

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
            return (
                opt?.required !== options[index]?.required &&
                opt?.name !== options[index]?.name &&
                opt?.options?.length !== options.length
            );
        }).length !== 0);
    }
}
