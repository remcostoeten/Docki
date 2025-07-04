"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const defaultConfig = {
    extensions: [], // Add default extensions if needed
    excludeDirectories: [], // Add default directories if needed
    ollamaModel: 'codellama:7b',
    maxDescriptionLength: 80, // Default maximum line length for descriptions
};
/**
 * Searches for the configuration file in the current working directory and home directory.
 * @returns The merged configuration object.
 */
function getConfig() {
    const cwdConfigPath = path_1.default.join(process.cwd(), 'docstring.config.json');
    const homeConfigPath = path_1.default.join(os_1.default.homedir(), 'docstring.config.json');
    let userConfig = {};
    if (fs_1.default.existsSync(cwdConfigPath)) {
        userConfig = JSON.parse(fs_1.default.readFileSync(cwdConfigPath, 'utf-8'));
    }
    else if (fs_1.default.existsSync(homeConfigPath)) {
        userConfig = JSON.parse(fs_1.default.readFileSync(homeConfigPath, 'utf-8'));
    }
    return { ...defaultConfig, ...userConfig };
}
//# sourceMappingURL=config-loader.js.map