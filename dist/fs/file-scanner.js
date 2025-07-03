"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanForTypeScriptFiles = scanForTypeScriptFiles;
exports.checkFileExists = checkFileExists;
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function scanForTypeScriptFiles() {
    const patterns = ['**/*.ts', '**/*.tsx'];
    const excludePatterns = [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.nuxt/**',
        '**/.output/**'
    ];
    const files = await (0, fast_glob_1.default)(patterns, {
        ignore: excludePatterns,
        onlyFiles: true,
        absolute: true
    });
    const filesWithStats = await Promise.all(files.map(async (filepath) => {
        try {
            const stats = await fs_1.default.promises.stat(filepath);
            return {
                filepath,
                relativePath: path_1.default.relative(process.cwd(), filepath),
                lastModified: stats.mtime
            };
        }
        catch (error) {
            // If we can't stat the file, include it without modification time
            return {
                filepath,
                relativePath: path_1.default.relative(process.cwd(), filepath),
                lastModified: new Date(0) // fallback to epoch
            };
        }
    }));
    // Sort by modification time, newest first
    return filesWithStats.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}
async function checkFileExists(filepath) {
    const fs = await Promise.resolve().then(() => __importStar(require('fs-extra')));
    return fs.pathExists(filepath);
}
//# sourceMappingURL=file-scanner.js.map