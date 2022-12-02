import { Dirent, readdirSync } from "fs";

/**
 * Loads all subdirectories from the specified folder.
 * @param dir - Directory to check
 */
function getAllSubdirectories(dir: string): [string, string][] {
    const files: Dirent[] = readdirSync(dir, { withFileTypes: true });
    const subdirectories: [string, string][] = [];
    for (const file of files) {
        if (file.isDirectory()) {
            let directoryName: string | string[] = file.name.replace(/\\/g, "/").split("/");
            directoryName = directoryName[directoryName.length - 1];

            subdirectories.push([`${dir}/${file.name}`, directoryName]);
        }
    }

    return subdirectories;
}

/**
 * Loads all files from the specified folder.
 * @param dir - Directory to check
 * @param extension - Files extension
 */
function getAllFiles(dir: string, extension?: string): [string, string][] {
    const files: Dirent[] = readdirSync(dir, { withFileTypes: true });
    let resolvedFiles: [string, string][] = [];
    for (const file of files) {
        if (file.isDirectory())
            resolvedFiles = [...resolvedFiles, ...getAllFiles(`${dir}/${file.name}`, extension)];
        else if ((file.name.endsWith(extension || ".js") || file.name.endsWith(".cjs")) && !file.name.startsWith("!")) {
            let fileName: string | string[] = file.name.replace(/\\/g, "/").split("/");
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split(".")[0].toLowerCase();

            resolvedFiles.push([`${dir}/${file.name}`, fileName]);
        }
    }

    return resolvedFiles;
}

export {
    getAllSubdirectories,
    getAllFiles
};
