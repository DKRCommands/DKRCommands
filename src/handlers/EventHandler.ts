import { existsSync } from "fs";
import { Client } from "discord.js";
import { DKRCommands } from "../index";
import { getAllFiles, getAllSubdirectories } from "../utils";

/**
 * The class responsible for checking and registering events.
 */
class EventHandler {
    private readonly client: Client;
    private _amount = 0;

    constructor(instance: DKRCommands, client: Client, dir: string, typeScript = false) {
        this.client = client;
        this.checkAndSetup(instance, dir, typeScript).then();
    }

    /**
     * Checks for the existence of the specified event folder and registers all of them.
     * @param instance - DKRCommands instance
     * @param dir - events directory
     * @param typeScript - if program runs as TypeScript
     * @private
     */
    private async checkAndSetup(instance: DKRCommands, dir: string, typeScript: boolean): Promise<void> {
        if (dir) {
            if (!existsSync(dir))
                throw new Error(`Events directory "${dir}" doesn't exist!`);

            const subdirectories = getAllSubdirectories(dir);
            for (const [directory, directoryName] of subdirectories)
                this._amount += await this.registerEvents(instance, directory, directoryName, typeScript);

            console.log(`DKRCommands > Loaded ${this._amount} event${this._amount === 1 ? "" : "s"}.`);
        }
    }

    /**
     * Checks the entered parameters of the event files directory and, if correct, registers the events.
     * @param instance - DKRCommands instance
     * @param directory - event files directory
     * @param directoryName - event files directory name
     * @param typeScript - if program runs as TypeScript
     * @private
     */
    private async registerEvents(instance: DKRCommands, directory: string, directoryName: string, typeScript: boolean): Promise<number> {
        const files = getAllFiles(directory, typeScript ? ".ts" : "");
        for (const [file] of files) {
            let event = await require(file);
            if (event.default && Object.keys(event).length === 1)
                event = event.default;

            this.client.on(directoryName, async function (...args) {
                event(instance, ...args);
            });
        }

        return files.length;
    }

    /**
     * Returns number of loaded events.
     */
    get amount(): number {
        return this._amount;
    }
}

export {
    EventHandler
};
