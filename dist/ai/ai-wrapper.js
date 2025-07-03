"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocstringWithAI = generateDocstringWithAI;
const promises_1 = __importDefault(require("fs/promises"));
const ollama_service_1 = require("./ollama-service");
const config_loader_1 = require("../config/config-loader");
/**
 * Wrapper function to generate docstring data from a TypeScript file using AI
 * @param filepath Path to the TypeScript file to analyze
 * @returns Generated docstring data
 */
async function generateDocstringWithAI(filepath) {
    try {
        // Read the file content
        const sourceCode = await promises_1.default.readFile(filepath, 'utf-8');
        // Get config for Ollama model
        const config = (0, config_loader_1.getConfig)();
        // Generate documentation using Ollama
        const generatedDoc = await (0, ollama_service_1.generateDocumentation)(sourceCode, {
            model: config.ollamaModel,
        });
        return generatedDoc;
    }
    catch (error) {
        console.error('AI Debug - Error details:', error);
        throw new Error(`Failed to generate docstring for ${filepath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=ai-wrapper.js.map