"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildCommandModel = void 0;
const mongoose_1 = require("mongoose");
const guildCommand = new mongoose_1.Schema({
    server: String,
    command: String,
    enabled: Boolean,
    allowedChannels: [String],
    requiredRoles: [String]
});
const GuildCommandModel = (0, mongoose_1.model)("dkrcommands-guild-commands", guildCommand);
exports.GuildCommandModel = GuildCommandModel;
