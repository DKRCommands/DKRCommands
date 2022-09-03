import { existsSync } from "fs";
import { Client } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "./Command";
import { abilityToRunCommand, getAllFiles } from "../utils";

/**
 * The class responsible for checking and registering commands.
 */
class CommandHandler {
    private commands: Map<string, Command> = new Map();
    private client: Client;

    constructor(instance: DKRCommands, client: Client, dir: string, typeScript = false) {
        this.client = client;
        this.checkAndSetup(instance, client, dir, typeScript).then();
    }

    /**
     * Checks for the existence of the specified command folder and registers all of them.
     * @param instance - DKRCommands instance
     * @param client - Discord client
     * @param dir - commands directory
     * @param typeScript - if program runs as TypeScript
     * @private
     */
    private async checkAndSetup(instance: DKRCommands, client: Client, dir: string, typeScript: boolean): Promise<void> {
        if (dir) {
            if (!existsSync(dir))
                throw new Error(`Commands directory "${dir}" doesn't exist!`);

            const files = getAllFiles(dir, typeScript ? ".ts" : "");
            const amount = files.length;

            console.log(`DKRCommands > Loaded ${amount} command${amount === 1 ? "" : "s"}.`);

            for (const [file, fileName] of files)
                await this.registerCommand(instance, client, file, fileName);

            client.on("messageCreate", async (message) => {
                const guild = message.guild;
                const prefix = instance.getPrefix(guild).toLowerCase();

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
                    if (!abilityToRunCommand(instance, command, guild, channel, member, user, (content) => {
                        message.reply({
                            content
                        }).then();
                    }))
                        return;

                    try {
                        command.execute(message, args).then();
                    } catch (e) {
                        if (command.error)
                            command.error({
                                command: command.name,
                                message,
                                info: {
                                    error: e,
                                },
                            });
                        else {
                            message.reply("An error occurred when running this command! This error has been reported to the developers.").then();
                            console.error(e);
                        }
                    }
                }
            });
        }
    }

    /**
     * Checks the entered parameters of the command and, if correct, registers the command.
     * @param instance - DKRCommands instance
     * @param client - Discord client
     * @param file - command file
     * @param fileName - command file name
     * @private
     */
    private async registerCommand(instance: DKRCommands, client: Client, file: string, fileName: string): Promise<void> {
        let configuration = await require(file);
        if (configuration.default && Object.keys(configuration).length === 1)
            configuration = configuration.default;

        const {
            name = fileName,
            category,
            commands,
            aliases,
            init,
            callback,
            run,
            execute,
            error,
            description,
            slash,
            options = [],
            testOnly
        } = configuration;

        if (run || execute)
            throw new Error(`Command located at "${file}" has either a "run" or "execute" function. Please rename that function to "callback".`);

        let names = commands || aliases || [];
        if (!name && (!names || names.length === 0))
            throw new Error(`Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`);
        if (typeof names === "string")
            names = [names];
        if (name && !names.includes(name.toLowerCase()))
            names.unshift(name.toLowerCase());

        const missing = [];
        if (!category)
            missing.push("Category");
        if (!description)
            missing.push("Description");
        if (missing.length && instance.showWarns)
            console.warn(`DKRCommands > Command "${names[0]}" does not have the following properties: ${missing}.`);

        if (testOnly && !instance.testServers?.length)
            console.warn(`DKRCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`);

        if (typeof slash !== "boolean" && slash !== "both")
            throw new Error(`DKRCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`);
        if (!slash && options.length)
            throw new Error(`DKRCommands > Command "${names[0]}" has an "options" property but is not a slash command.`);
        if (slash) {
            if (!description)
                throw new Error(`DKRCommands > A description is required for command "${names[0]}" because it is a slash command.`);

            if (options.length) {
                for (const key in options) {
                    const name = options[key].name;
                    let lowerCase = name.toLowerCase();
                    if (name !== lowerCase && instance.showWarns)
                        console.log(`DKRCommands > Command "${names[0]}" has an option of "${name}". All option names must be lower case for slash commands. DKRCommands will modify this for you.`);

                    if (lowerCase.match(/\s/g)) {
                        lowerCase = lowerCase.replace(/\s/g, "_");
                        console.log(`DKRCommands > Command "${names[0]}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. DKRCommands will modify this for you.`);
                    }

                    options[key].name = lowerCase;
                }
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
                init(client, instance);

            const command = new Command(instance, client, names, callback, error, configuration);
            for (const name of names)
                this.commands.set(name.toLowerCase(), command);
        }
    }

    /**
     * Returns the corresponding command according to the specified name.
     * @param name - command name
     */
    public getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }
}

export {
    CommandHandler
};
