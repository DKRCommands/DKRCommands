import { model, Schema } from "mongoose";
import { Snowflake } from "discord.js";

interface GuildCommands {
    server: string;
    command: string;
    enabled: boolean;
    allowedChannels: Snowflake[];
    requiredRoles: Snowflake[];
}

const guildCommand = new Schema<GuildCommands>({
    server: String,
    command: String,
    enabled: Boolean,
    allowedChannels: [String],
    requiredRoles: [String]
});

const GuildCommandModel = model("dkrcommands-guild-commands", guildCommand);

export {
    GuildCommands,
    GuildCommandModel
};
