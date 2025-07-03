"use strict";
/**
 * @description
 * TODO: AI-generated description
 *

 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasExistingDocstring = hasExistingDocstring;
exports.injectDocstring = injectDocstring;
const file_operations_1 = require("../fs/file-operations");
async function hasExistingDocstring(filepath) {
    const content = await (0, file_operations_1.readFileContent)(filepath);
    const trimmed = content.trim();
    return trimmed.startsWith('/**');
}
async function injectDocstring(filepath, docstring) {
    await (0, file_operations_1.createBackup)(filepath);
    const originalContent = await (0, file_operations_1.readFileContent)(filepath);
    const formattedDocstring = docstring.endsWith('\n\n') ? docstring : docstring + '\n\n';
    const newContent = formattedDocstring + originalContent;
    await (0, file_operations_1.writeFileContent)(filepath, newContent);
}
//# sourceMappingURL=docstring-injector.js.map