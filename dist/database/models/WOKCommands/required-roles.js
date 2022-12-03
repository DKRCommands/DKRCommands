"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredRoleModel = void 0;
const mongoose_1 = require("mongoose");
const requiredRole = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
    requiredRoles: {
        type: [String],
        required: true,
    },
});
const RequiredRoleModel = (0, mongoose_1.model)("wokcommands-required-roles", requiredRole);
exports.RequiredRoleModel = RequiredRoleModel;
