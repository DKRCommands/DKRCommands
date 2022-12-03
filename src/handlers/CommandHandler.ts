import { existsSync } from "fs";
import { Client, Guild, Message, PermissionsBitField } from "discord.js";
import { DKRCommands, ICommand } from "../index";
import { Command } from "./Command";
import { abilityToRunCommand, getAllFiles } from "../utils";

/**
 * The class responsible for checking and registering commands.
 */
class CommandHandler {
    private readonly client: Client;
    private _files: [string, string][] = [];
    private commands: Map<string, Command> = new Map();

    constructor(instance: DKRCommands, client: Client, dir: string, typeScript = false) {
        this.client = client;
        this.checkAndSetup(instance, dir, typeScript).then();
    }

    /**
     * Checks for the existence of the specified command folder and registers all of them.
     * @param instance - DKRCommands instance
     * @param dir - commands directory
     * @param typeScript - if program runs as TypeScript
     * @private
     */
    private async checkAndSetup(instance: DKRCommands, dir: string, typeScript: boolean): Promise<void> {
        if (dir) {
            if (!existsSync(dir))
                throw new Error(`Commands directory "${dir}" doesn't exist!`);

            this._files = getAllFiles(dir, typeScript ? ".ts" : "");
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
                    if (!await abilityToRunCommand(instance, command, guild, channel, member, user, (reply: string | object) => {
                        message.reply(reply).then();
                    }))
                        return;

                    this.invokeCommand(instance, command, guild, message, args).then();
                }
            });
        }
    }

    /**
     * Calls the callback method of the legacy command.
     * @param instance - DKRCommands instance
     * @param command - DKRCommands command instance
     * @param guild -Discord guild
     * @param message - Discord message
     * @param args - Command arguments
     */
    public async invokeCommand(instance: DKRCommands, command: Command, guild: Guild | null, message: Message, args: string[]) {
        try {
            command.execute(message, args.join(" ")).then();
        } catch (e) {
            console.error(e);

            if (instance.errorMessages)
                message.reply("An error occurred when running this command! This error has been reported to the developers.").then();
            instance.emit("commandException", instance, guild, command, e as Error, (reply: string | object) => {
                message.reply(reply).then();
            });
        }
    }

    /**
     * Checks the entered parameters of the command and, if correct, registers the command.
     * @param instance - DKRCommands instance
     * @param file - command file
     * @param fileName - command file name
     * @private
     */
    private async registerCommand(instance: DKRCommands, file: string, fileName: string): Promise<void> {
        let configuration = await require(file);
        if (configuration.default && Object.keys(configuration).length === 1)
            configuration = configuration.default;

        const {
            name = fileName,
            aliases,
            description,
            slash,
            permissions,
            testOnly,
            options = [],
            init,
            callback
        }: ICommand = configuration;

        let names = aliases || [];
        if (!name && (!names || names.length === 0))
            throw new Error(`Command located at "${file}" does not have a name, or aliases array set. Please set at lease one property to specify the command name.`);
        if (typeof names === "string")
            names = [names];
        if (name && !names.includes(name.toLowerCase()))
            names.unshift(name.toLowerCase());

        if (permissions)
            for (const perm of permissions) {
                if (typeof perm !== "bigint" || !(new PermissionsBitField(perm).toArray().length))
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

            const command = new Command(instance, this.client, names, callback, configuration);
            for (const name of names)
                this.commands.set(name.toLowerCase(), command);
        }
    }

    /**
     * Checks whether the slash command option name meet the required parameters.
     * @param instance - DKRCommands instance
     * @param command - command name
     * @param name - option name
     * @private
     */
    private checkName(instance: DKRCommands, command: string, name: string): string {
        name = this.checkLowerCaseName(instance, command, name);
        name = this.checkSpaceInName(command, name);

        return name;
    }

    /**
     * Checks whether the name of the slash command option contains spaces and corrects the name if necessary.
     * @param command - command name
     * @param name - option name
     * @private
     */
    private checkSpaceInName(command: string, name: string): string {
        if (name.match(/\s/g))
            console.log(`DKRCommands > Command "${command}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. DKRCommands will modify this for you.`);

        return name.replace(/\s/g, "_");
    }

    /**
     * Checks if the name of the slash command option is lowercase and corrects the name if necessary.
     * @param instance - DKRCommands instance
     * @param command - command name
     * @param name - option name
     * @private
     */
    private checkLowerCaseName(instance: DKRCommands, command: string, name: string): string {
        if (name !== name.toLowerCase() && instance.showWarns)
            console.log(`DKRCommands > Command "${command}" has an option of "${name}". All option names must be lower case for slash commands. DKRCommands will modify this for you.`);

        return name.toLowerCase();
    }

    /**
     * Returns the corresponding command according to the specified name.
     * @param name - command name
     */
    public getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }

    get files(): [string, string][] {
        return this._files;
    }
}

export {
    CommandHandler
};
