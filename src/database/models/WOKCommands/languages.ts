import { model, Schema } from "mongoose";

const language = new Schema({
    _id: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
});

const LanguageModel = model("wokcommands-languages", language);

export {
    LanguageModel
};
