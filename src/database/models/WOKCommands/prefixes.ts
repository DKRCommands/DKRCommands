import { model, Schema } from "mongoose";

const prefix = new Schema({
    _id: {
        type: String,
        required: true,
    },
    prefix: {
        type: String,
        required: true,
    },
});

const PrefixModel = model("wokcommands-prefixes", prefix);

export {
    PrefixModel
};
