"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageModel = void 0;
const mongoose_1 = require("mongoose");
const language = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
});
const LanguageModel = (0, mongoose_1.model)("wokcommands-languages", language);
exports.LanguageModel = LanguageModel;
