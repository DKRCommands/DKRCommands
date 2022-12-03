import { Client, Guild, Message } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "./Command";
declare class CommandHandler {
    private readonly client;
    private _files;
    private commands;
    constructor(instance: DKRCommands, client: Client, dir: string, typeScript?: boolean);
    private checkAndSetup;
    invokeCommand(instance: DKRCommands, command: Command, guild: Guild | null, message: Message, args: string[]): Promise<void>;
    private registerCommand;
    private checkName;
    private checkSpaceInName;
    private checkLowerCaseName;
    getCommand(name: string): Command | undefined;
    get files(): [string, string][];
}
export { CommandHandler };
