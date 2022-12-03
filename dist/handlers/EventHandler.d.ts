import { Client } from "discord.js";
import { DKRCommands } from "../index";
declare class EventHandler {
    private readonly client;
    private _amount;
    constructor(instance: DKRCommands, client: Client, dir: string, typeScript?: boolean);
    private checkAndSetup;
    private registerEvents;
    get amount(): number;
}
export { EventHandler };
