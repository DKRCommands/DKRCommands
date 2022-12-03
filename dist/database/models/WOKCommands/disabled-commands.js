"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabledCommandModel = void 0;
const mongoose_1 = require("mongoose");
const disabledCommand = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
});
const DisabledCommandModel = (0, mongoose_1.model)("wokcommands-disabled-commands", disabledCommand);
exports.DisabledCommandModel = DisabledCommandModel;
