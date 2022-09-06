import { model, Schema } from "mongoose";

const requiredRole = new Schema({
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

const RequiredRoleModel = model("wokcommands-required-roles", requiredRole);

export {
    RequiredRoleModel
};
