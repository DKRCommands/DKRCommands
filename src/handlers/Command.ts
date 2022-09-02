import { Client } from "discord.js";
import { DJSCommands } from "../index";
import { ICallbackObject, ICommand, IErrorObject } from "../interfaces";

/**
 * A class containing a constructor for individual commands.
 */
export class Command {
    private readonly instance: DJSCommands;
    private readonly client: Client;
    private readonly names: string[];
    private readonly description: string;
    private readonly testOnly: boolean;
    private readonly slash: boolean;

    public callback: (obj: ICallbackObject) => void;
    public error: (obj: IErrorObject) => void;

    constructor(instance: DJSCommands, client: Client, names: string[], callback: () => void, error: () => void, {
        description,
        testOnly = false,
        slash = false
    }: ICommand) {
        this.instance = instance;
        this.client = client;
        this.names = names;
        this.description = description;
        this.testOnly = testOnly;
        this.slash = slash;
        this.callback = callback;
        this.error = error;
    }
}
