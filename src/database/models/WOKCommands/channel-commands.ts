import { model, Schema } from "mongoose";

const channelCommand = new Schema({
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

const ChannelCommandModel = model("wokcommands-channel-commands", channelCommand);

export {
    ChannelCommandModel
};
