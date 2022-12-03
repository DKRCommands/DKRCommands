import { Connection, ConnectionStates, ConnectOptions } from "mongoose";
import { Guild } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "../handlers";

interface DKRCommandsEvents {
    "databaseConnected": (connection: Connection, state: ConnectionStates) => void;
    "invalidSlashCommand": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandException": (instance: DKRCommands, guild: Guild | null, command: Command, error: Error, send: (message: string | object) => void) => void;
    "commandCooldown": (instance: DKRCommands, guild: Guild | null, type: string, remainingSeconds: number, send: (message: string | object) => void) => void;
    "commandDisabled": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandGuildOnly": (instance: DKRCommands, send: (message: string | object) => void) => void;
    "commandOwnerOnly": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandDisallowedChannel": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandMissingPermission": (instance: DKRCommands, guild: Guild | null, permission: string, send: (message: string | object) => void) => void;
    "commandMissingRole": (instance: DKRCommands, guild: Guild | null, role: string, send: (message: string | object) => void) => void;
    "commandRequiresVoice": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandRequiresSameVoice": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
}

interface Options {
    commandsDir: string;
    eventsDir?: string;
    prefix?: string;
    showWarns?: boolean;
    errorMessages?: boolean;
    ignoreBots?: boolean;
    testServers?: string | string[];
    botOwners?: string | string[];
    ephemeral?: boolean;
    debug?: boolean;
    typeScript?: boolean;
    mongoUri?: string;
    dbOptions?: ConnectOptions;
    databaseBackwardCompatibility?: boolean;
    plugins?: Plugin[];
}

abstract class Plugin {
    abstract load(instance: DKRCommands): void;

    abstract unload(): void;
}

export {
    DKRCommandsEvents,
    Options,
    Plugin
};
