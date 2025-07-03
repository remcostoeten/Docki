"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTemplates = loadTemplates;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function loadTemplates() {
    const templatesDir = path_1.default.join(__dirname, '../../templates');
    await fs_extra_1.default.ensureDir(templatesDir);
    const files = await fs_extra_1.default.readdir(templatesDir);
    const templateFiles = files.filter(file => file.endsWith('.txt'));
    if (templateFiles.length === 0) {
        await createDefaultTemplate(templatesDir);
        return loadTemplates();
    }
    const templates = [];
    for (const file of templateFiles) {
        const filepath = path_1.default.join(templatesDir, file);
        const content = await fs_extra_1.default.readFile(filepath, 'utf-8');
        const name = path_1.default.basename(file, '.txt');
        templates.push({
            name,
            content,
            filepath
        });
    }
    return templates;
}
async function createDefaultTemplate(templatesDir) {
    const defaultTemplate = `/**
 * @description
 * $DESCRIPTION
 *
$EMOJI_LINE$AUTHOR_LINE
 */`;
    await fs_extra_1.default.writeFile(path_1.default.join(templatesDir, 'default.txt'), defaultTemplate, 'utf-8');
}
//# sourceMappingURL=template-loader.js.map