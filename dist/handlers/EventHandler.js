"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
const fs_1 = require("fs");
const utils_1 = require("../utils");
class EventHandler {
    client;
    _amount = 0;
    constructor(instance, client, dir, typeScript = false) {
        this.client = client;
        this.checkAndSetup(instance, dir, typeScript).then();
    }
    async checkAndSetup(instance, dir, typeScript) {
        if (dir) {
            if (!(0, fs_1.existsSync)(dir))
                throw new Error(`Events directory "${dir}" doesn't exist!`);
            const subdirectories = (0, utils_1.getAllSubdirectories)(dir);
            for (const [directory, directoryName] of subdirectories)
                this._amount += await this.registerEvents(instance, directory, directoryName, typeScript);
            console.log(`DKRCommands > Loaded ${this._amount} event${this._amount === 1 ? "" : "s"}.`);
        }
    }
    async registerEvents(instance, directory, directoryName, typeScript) {
        const files = (0, utils_1.getAllFiles)(directory, typeScript ? ".ts" : "");
        for (const [file] of files) {
            let event = await require(file);
            if (event.default && Object.keys(event).length === 1)
                event = event.default;
            this.client.on(directoryName, async function (...args) {
                event(instance, ...args);
            });
        }
        return files.length;
    }
    get amount() {
        return this._amount;
    }
}
exports.EventHandler = EventHandler;
