import { Connection, ConnectionStates } from "mongoose";
import { Guild } from "discord.js";
import { DKRCommands } from "../index";
import { Command } from "../handlers";

interface DKRCommandsEvents {
    "databaseConnected": (connection: Connection, state: ConnectionStates) => void;
    "invalidSlashCommand": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandException": (instance: DKRCommands, guild: Guild | null, command: Command, error: Error, send: (message: string | object) => void) => void;
    "commandCooldown": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandDisabled": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandGuildOnly": (instance: DKRCommands, send: (message: string | object) => void) => void;
    "commandOwnerOnly": (instance: DKRCommands, guild: Guild | null, send: (message: string | object) => void) => void;
    "commandMissingPermission": (instance: DKRCommands, guild: Guild | null, permission: string, send: (message: string | object) => void) => void;
    "commandMissingRole": (instance: DKRCommands, guild: Guild | null, role: string, send: (message: string | object) => void) => void;
}

export {
    DKRCommandsEvents
};
