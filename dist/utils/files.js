"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.getAllSubdirectories = void 0;
const fs_1 = require("fs");
function getAllSubdirectories(dir) {
    const files = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
    const subdirectories = [];
    for (const file of files) {
        if (file.isDirectory()) {
            let directoryName = file.name.replace(/\\/g, "/").split("/");
            directoryName = directoryName[directoryName.length - 1];
            subdirectories.push([`${dir}/${file.name}`, directoryName]);
        }
    }
    return subdirectories;
}
exports.getAllSubdirectories = getAllSubdirectories;
function getAllFiles(dir, extension) {
    const files = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
    let resolvedFiles = [];
    for (const file of files) {
        if (file.isDirectory())
            resolvedFiles = [...resolvedFiles, ...getAllFiles(`${dir}/${file.name}`, extension)];
        else if ((file.name.endsWith(extension || ".js") || file.name.endsWith(".cjs")) && !file.name.startsWith("!")) {
            let fileName = file.name.replace(/\\/g, "/").split("/");
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split(".")[0].toLowerCase();
            resolvedFiles.push([`${dir}/${file.name}`, fileName]);
        }
    }
    return resolvedFiles;
}
exports.getAllFiles = getAllFiles;
