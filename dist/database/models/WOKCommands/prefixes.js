"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixModel = void 0;
const mongoose_1 = require("mongoose");
const prefix = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
    },
    prefix: {
        type: String,
        required: true,
    },
});
const PrefixModel = (0, mongoose_1.model)("wokcommands-prefixes", prefix);
exports.PrefixModel = PrefixModel;
