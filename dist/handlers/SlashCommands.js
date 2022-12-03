"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommands = void 0;
const util_1 = require("util");
const discord_js_1 = require("discord.js");
const utils_1 = require("../utils");
class SlashCommands {
    client;
    instance;
    constructor(instance, listen) {
        this.instance = instance;
        this.client = instance.client;
        this.checkAndSetup(listen).then();
    }
    async checkAndSetup(listen) {
        if (listen) {
            this.client.on("interactionCreate", async (interaction) => {
                if (!interaction.isChatInputCommand())
                    return;
                const { commandName, guild, user, channelId } = interaction;
                const member = interaction.member;
                const channel = guild?.channels.cache.get(channelId) || null;
                const command = this.instance.commandHandler.getCommand(commandName);
                if (!command) {
                    if (this.instance.errorMessages)
                        interaction.reply({
                            content: "This slash command is not properly registered.",
                            ephemeral: this.instance.ephemeral
                        }).then();
                    this.instance.emit("invalidSlashCommand", this.instance, guild, (reply) => {
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
                if (!await (0, utils_1.abilityToRunCommand)(this.instance, command, guild, channel, member, user, (reply) => {
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
                this.invokeCommand(interaction, command).then();
            });
        }
        this.checkAndDelete(this.instance.testServers, (await Promise.all(this.instance.commandHandler.files.map(async (file) => {
            let configuration = await require(file[0]);
            if (configuration.default && Object.keys(configuration).length === 1)
                configuration = configuration.default;
            const { slash, testOnly } = configuration;
            return {
                name: file[1].toLowerCase(),
                slash: slash || false,
                testOnly: testOnly || false
            };
        }))).filter((file) => (file.slash === true || file.slash === "both"))).then();
    }
    async invokeCommand(interaction, command) {
        const reply = await command.callback({
            instance: this.instance,
            client: this.client,
            interaction,
            guild: interaction.guild,
            member: interaction.member,
            channel: interaction.channel,
            user: interaction.user
        });
        if (reply && !(reply instanceof discord_js_1.InteractionResponse) && !(reply instanceof discord_js_1.Message)) {
            if (typeof reply === "string")
                interaction.reply({
                    content: reply,
                }).then();
            else if (typeof reply === "object")
                interaction.reply(reply).then();
        }
    }
    async create(name, description, options, guildId) {
        let commands;
        if (guildId)
            commands = this.client.guilds.cache.get(guildId)?.commands;
        else
            commands = this.client.application?.commands;
        if (!commands)
            return;
        await commands.fetch({});
        const cmd = commands.cache.find((cmd) => cmd.name === name);
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
    didOptionsChange(command, options) {
        return (command.options?.filter((opt, index) => {
            return !(0, util_1.isDeepStrictEqual)(JSON.parse(JSON.stringify(opt)), options[index]);
        }).length !== 0);
    }
    async checkAndDelete(testServers, commands) {
        const globalCommands = await this.getCommands();
        const deletedGlobalCommands = globalCommands?.map((globalCommand) => {
            return {
                id: globalCommand.id,
                name: globalCommand.name
            };
        }).filter((globalCommand) => commands.filter((command) => !command.testOnly).map((command) => command.name).indexOf(globalCommand.name) === -1);
        for (const globalCommand of deletedGlobalCommands || [])
            this.deleteCommand(globalCommand.id).then();
        if (deletedGlobalCommands?.length !== 0)
            console.log(`DKRCommands > Deleting ${deletedGlobalCommands?.length} global slash command${deletedGlobalCommands?.length === 1 ? "" : "s"}.`);
        for (const testServer of testServers) {
            const guildCommands = await this.getCommands(testServer);
            const deletedGuildCommands = guildCommands?.map((guildCommand) => {
                return {
                    id: guildCommand.id,
                    name: guildCommand.name
                };
            }).filter((guildCommand) => commands.map((command) => command.name).indexOf(guildCommand.name) === -1);
            for (const guildCommand of deletedGuildCommands || [])
                this.deleteCommand(guildCommand.id, testServer).then();
            if (deletedGuildCommands?.length !== 0)
                console.log(`DKRCommands > Deleting ${deletedGuildCommands?.length} slash command${deletedGuildCommands?.length === 1 ? "" : "s"} from guild ${testServer}.`);
        }
    }
    async getCommands(guild) {
        let commands;
        if (guild)
            commands = this.client.guilds.cache.get(guild)?.commands;
        else
            commands = this.client.application?.commands;
        await commands?.fetch({});
        return commands?.cache;
    }
    async deleteCommand(id, guild) {
        const commands = await this.getCommands(guild);
        const command = commands?.get(id);
        if (command) {
            console.log(`DKRCommands > Deleting${guild ? " guild" : ""} slash command "${command.name}"`);
            command.delete().then();
        }
        return command;
    }
}
exports.SlashCommands = SlashCommands;
