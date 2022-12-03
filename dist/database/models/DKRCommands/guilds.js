"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = void 0;
const mongoose_1 = require("mongoose");
const guild = new mongoose_1.Schema({
    server: String,
    prefix: String,
    language: String
});
const GuildModel = (0, mongoose_1.model)("dkrcommands-guilds", guild);
exports.GuildModel = GuildModel;
