"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileContent = readFileContent;
exports.writeFileContent = writeFileContent;
exports.createBackup = createBackup;
exports.restoreBackup = restoreBackup;
exports.removeBackup = removeBackup;
const fs_extra_1 = __importDefault(require("fs-extra"));
async function readFileContent(filepath) {
    return fs_extra_1.default.readFile(filepath, 'utf-8');
}
async function writeFileContent(filepath, content) {
    await fs_extra_1.default.writeFile(filepath, content, 'utf-8');
}
async function createBackup(filepath) {
    const backupPath = `${filepath}.docstring-backup`;
    await fs_extra_1.default.copy(filepath, backupPath);
    return backupPath;
}
async function restoreBackup(filepath) {
    const backupPath = `${filepath}.docstring-backup`;
    if (await fs_extra_1.default.pathExists(backupPath)) {
        await fs_extra_1.default.copy(backupPath, filepath);
        await fs_extra_1.default.remove(backupPath);
    }
}
async function removeBackup(filepath) {
    const backupPath = `${filepath}.docstring-backup`;
    if (await fs_extra_1.default.pathExists(backupPath)) {
        await fs_extra_1.default.remove(backupPath);
    }
}
//# sourceMappingURL=file-operations.js.map