"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const fs_1 = require("fs");
const discord_js_1 = require("discord.js");
const Command_1 = require("./Command");
const utils_1 = require("../utils");
class CommandHandler {
    client;
    _files = [];
    commands = new Map();
    constructor(instance, client, dir, typeScript = false) {
        this.client = client;
        this.checkAndSetup(instance, dir, typeScript).then();
    }
    async checkAndSetup(instance, dir, typeScript) {
        if (dir) {
            if (!(0, fs_1.existsSync)(dir))
                throw new Error(`Commands directory "${dir}" doesn't exist!`);
            this._files = (0, utils_1.getAllFiles)(dir, typeScript ? ".ts" : "");
            const amount = this._files.length;
            console.log(`DKRCommands > Loaded ${amount} command${amount === 1 ? "" : "s"}.`);
            for (const [file, fileName] of this._files)
                await this.registerCommand(instance, file, fileName);
            this.client.on("messageCreate", async (message) => {
                const guild = message.guild;
                const prefix = (await instance.getPrefix(guild)).toLowerCase();
                if (instance.ignoreBots && message.author.bot)
                    return;
                if (message.content.toLowerCase().startsWith(prefix)) {
                    const args = message.content.substring(prefix.length).replace(/\s+/g, " ").trim().split(" ");
                    const commandName = args.shift();
                    if (!commandName)
                        return;
                    const command = this.commands.get(commandName.toLowerCase());
                    if (!command || command.slash === true)
                        return;
                    const { member, author: user, channel } = message;
                    if (!await (0, utils_1.abilityToRunCommand)(instance, command, guild, channel, member, user, (reply) => {
                        message.reply(reply).then();
                    }))
                        return;
                    this.invokeCommand(instance, command, guild, message, args).then();
                }
            });
        }
    }
    async invokeCommand(instance, command, guild, message, args) {
        try {
            command.execute(message, args.join(" ")).then();
        }
        catch (e) {
            console.error(e);
            if (instance.errorMessages)
                message.reply("An error occurred when running this command! This error has been reported to the developers.").then();
            instance.emit("commandException", instance, guild, command, e, (reply) => {
                message.reply(reply).then();
            });
        }
    }
    async registerCommand(instance, file, fileName) {
        let configuration = await require(file);
        if (configuration.default && Object.keys(configuration).length === 1)
            configuration = configuration.default;
        const { name = fileName, aliases, description, slash, permissions, testOnly, options = [], init, callback } = configuration;
        let names = aliases || [];
        if (!name && (!names || names.length === 0))
            throw new Error(`Command located at "${file}" does not have a name, or aliases array set. Please set at lease one property to specify the command name.`);
        if (typeof names === "string")
            names = [names];
        if (name && !names.includes(name.toLowerCase()))
            names.unshift(name.toLowerCase());
        if (permissions)
            for (const perm of permissions) {
                if (typeof perm !== "bigint" || !(new discord_js_1.PermissionsBitField(perm).toArray().length))
                    throw new Error(`Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be from Discords.js PermissionsBitField instance.`);
            }
        if (!description && instance.showWarns)
            console.warn(`DKRCommands > Command "${names[0]}" does not have a description set.`);
        if (testOnly && !instance.testServers?.length)
            console.warn(`DKRCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`);
        if (typeof slash !== "undefined" && typeof slash !== "boolean" && slash !== "both")
            throw new Error(`DKRCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`);
        if (!slash && options?.length)
            throw new Error(`DKRCommands > Command "${names[0]}" has an "options" property but is not a slash command.`);
        if (slash) {
            if (!description)
                throw new Error(`DKRCommands > A description is required for command "${names[0]}" because it is a slash command.`);
            if (options?.length)
                for (const option of options) {
                    option.name = this.checkName(instance, names[0], option.name);
                    if (option.options)
                        for (const subOption of option.options)
                            subOption.name = this.checkName(instance, names[0], subOption.name);
                }
            const slashCommands = instance.slashCommands;
            if (testOnly)
                for (const id of instance.testServers)
                    await slashCommands.create(names[0], description, options, id);
            else
                await slashCommands.create(names[0], description, options);
        }
        if (callback) {
            if (init)
                init(this.client, instance);
            const command = new Command_1.Command(instance, this.client, names, callback, configuration);
            for (const name of names)
                this.commands.set(name.toLowerCase(), command);
        }
    }
    checkName(instance, command, name) {
        name = this.checkLowerCaseName(instance, command, name);
        name = this.checkSpaceInName(command, name);
        return name;
    }
    checkSpaceInName(command, name) {
        if (name.match(/\s/g))
            console.log(`DKRCommands > Command "${command}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. DKRCommands will modify this for you.`);
        return name.replace(/\s/g, "_");
    }
    checkLowerCaseName(instance, command, name) {
        if (name !== name.toLowerCase() && instance.showWarns)
            console.log(`DKRCommands > Command "${command}" has an option of "${name}". All option names must be lower case for slash commands. DKRCommands will modify this for you.`);
        return name.toLowerCase();
    }
    getCommand(name) {
        return this.commands.get(name);
    }
    get files() {
        return this._files;
    }
}
exports.CommandHandler = CommandHandler;
