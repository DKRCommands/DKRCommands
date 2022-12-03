"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelCommandModel = void 0;
const mongoose_1 = require("mongoose");
const channelCommand = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
    channels: {
        type: [String],
        required: true,
    }
});
const ChannelCommandModel = (0, mongoose_1.model)("wokcommands-channel-commands", channelCommand);
exports.ChannelCommandModel = ChannelCommandModel;
