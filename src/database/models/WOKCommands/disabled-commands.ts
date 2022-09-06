import { model, Schema } from "mongoose";

const disabledCommand = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
});

const DisabledCommandModel = model("wokcommands-disabled-commands", disabledCommand);

export {
    DisabledCommandModel
};
