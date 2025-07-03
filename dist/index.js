#!/usr/bin/env node
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
exports.main = main;
const path_1 = __importDefault(require("path"));
const file_scanner_1 = require("./fs/file-scanner");
const template_loader_1 = require("./templates/template-loader");
const template_processor_1 = require("./core/template-processor");
const docstring_injector_1 = require("./core/docstring-injector");
const interface_1 = require("./cli/interface");
const prompts_1 = require("./cli/prompts");
const file_operations_1 = require("./fs/file-operations");
const ai_wrapper_1 = require("./ai/ai-wrapper");
const config_loader_1 = require("./config/config-loader");
// Colors for console output
const colors = {
    secondary: '\x1b[35m', // magenta
    muted: '\x1b[90m', // gray
    reset: '\x1b[0m' // reset
};
async function main() {
    try {
        // Handle revert command
        if (process.argv.includes('--revert')) {
            await handleRevert();
            return;
        }
        // Handle AI mode: docstring ai <filepath>
        if (process.argv[2] === 'ai') {
            const filepath = process.argv[3];
            if (!filepath) {
                (0, interface_1.displayError)('Filepath is required when using AI mode. Usage: docstring ai <filepath>');
                return;
            }
            await handleAiMode(filepath);
            return;
        }
        // Display intro
        (0, interface_1.displayIntro)();
        // Scan for TypeScript files
        console.log('🔍 Scanning files...');
        const files = await (0, file_scanner_1.scanForTypeScriptFiles)();
        if (files.length === 0) {
            (0, interface_1.displayError)('No TypeScript files found in the current directory');
            return;
        }
        // Load templates
        console.log('📋 Loading templates...');
        const templates = await (0, template_loader_1.loadTemplates)();
        // Run interactive flow
        const result = await (0, interface_1.runInteractiveFlow)(files, templates);
        // Check for existing docstring
        if (await (0, docstring_injector_1.hasExistingDocstring)(result.selectedFile)) {
            console.log('\n⚠️  Warning: File already contains a docstring at the beginning');
            const { prompt } = await Promise.resolve().then(() => __importStar(require('enquirer')));
            const response = await prompt({
                type: 'confirm',
                name: 'continue',
                message: 'Do you want to continue anyway?',
                initial: false
            });
            if (!response.continue) {
                console.log('\n👋 Operation cancelled.');
                return;
            }
        }
        // Find selected template
        const selectedTemplate = templates.find(t => t.name === result.selectedTemplate);
        if (!selectedTemplate) {
            (0, interface_1.displayError)('Selected template not found');
            return;
        }
        // Process template
        const processed = (0, template_processor_1.processTemplate)(selectedTemplate, result.TDocstringData);
        // Inject docstring
        await (0, docstring_injector_1.injectDocstring)(result.selectedFile, processed.content);
        // Clean up backup on success
        await (0, file_operations_1.removeBackup)(result.selectedFile);
        // Display success message
        (0, interface_1.displaySuccess)(path_1.default.relative(process.cwd(), result.selectedFile));
    }
    catch (error) {
        if (error instanceof Error) {
            // Check if this is a user cancellation
            if (error.message.includes('Operation cancelled by user') || error.message.includes('cancelled')) {
                console.log(`\n${colors.secondary}👋${colors.reset} ${colors.muted}Operation cancelled. Goodbye!${colors.reset}`);
                process.exit(0);
            }
            (0, interface_1.displayError)(error.message);
        }
        else {
            (0, interface_1.displayError)('An unexpected error occurred');
        }
        process.exit(1);
    }
}
async function handleAiMode(filepath) {
    try {
        // Validate file exists and is a TypeScript file
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        try {
            await fs.access(filepath);
        }
        catch {
            (0, interface_1.displayError)(`File not found: ${filepath}`);
            return;
        }
        if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx')) {
            (0, interface_1.displayError)('File must be a TypeScript file (.ts or .tsx)');
            return;
        }
        // Check for existing docstring
        if (await (0, docstring_injector_1.hasExistingDocstring)(filepath)) {
            (0, interface_1.displayError)('File already contains a docstring. Use --revert to remove it first.');
            return;
        }
        console.log('🤖 Generating docstring with AI...\n');
        let aiOutput;
        let fallbackToManual = false;
        try {
            // Generate docstring using AI
            aiOutput = await (0, ai_wrapper_1.generateDocstringWithAI)(filepath);
        }
        catch (error) {
            // Check if this is an Ollama-related error (binary missing, model unavailable, etc.)
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isOllamaError = errorMessage.includes('Ollama') ||
                errorMessage.includes('binary not found') ||
                errorMessage.includes('not available') ||
                errorMessage.includes('Failed to execute Ollama') ||
                errorMessage.includes('timeout');
            if (isOllamaError) {
                console.log('\n⚠️  Local AI unavailable – falling back to manual flow\n');
                fallbackToManual = true;
            }
            else {
                // For non-Ollama errors, still throw to maintain original error handling
                throw error;
            }
        }
        // Get config to check for default author
        const config = (0, config_loader_1.getConfig)();
        let docstringData;
        if (fallbackToManual) {
            // Fall back to interactive prompts for docstring data
            console.log('📝 Please provide docstring information manually:\n');
            docstringData = await (0, prompts_1.promptForDocstringData)();
        }
        else {
            // Construct TDocstringData using AI output
            docstringData = {
                description: aiOutput.description,
                emoji: aiOutput.emoji,
                author: config.defaultAuthor || aiOutput.author
            };
        }
        // Load templates
        console.log('📋 Loading templates...');
        const templates = await (0, template_loader_1.loadTemplates)();
        let selectedTemplate;
        if (fallbackToManual) {
            // Let user select template interactively
            const templateName = await (0, prompts_1.promptForTemplate)(templates);
            selectedTemplate = templates.find(t => t.name === templateName);
        }
        else {
            // Auto-select default template if set, else use first available
            if (config.defaultTemplate) {
                const defaultTemplate = templates.find(t => t.name === config.defaultTemplate);
                if (defaultTemplate) {
                    selectedTemplate = defaultTemplate;
                    console.log(`✅ Using default template: ${config.defaultTemplate}`);
                }
                else {
                    console.log(`⚠️  Default template '${config.defaultTemplate}' not found, using first available template`);
                    selectedTemplate = templates[0];
                }
            }
            else {
                // No default template set, use first available
                selectedTemplate = templates[0];
            }
        }
        if (!selectedTemplate) {
            (0, interface_1.displayError)('No templates found');
            return;
        }
        // Process template
        const processed = (0, template_processor_1.processTemplate)(selectedTemplate, docstringData);
        // Inject docstring (this creates backup automatically)
        await (0, docstring_injector_1.injectDocstring)(filepath, processed.content);
        // Clean up backup on success
        await (0, file_operations_1.removeBackup)(filepath);
        // Display success message
        (0, interface_1.displaySuccess)(path_1.default.relative(process.cwd(), filepath));
        if (fallbackToManual) {
            console.log('\n✅ Docstring added successfully using manual input!');
        }
        else {
            console.log('\n🤖 AI-generated docstring added successfully!');
        }
    }
    catch (error) {
        // Only exit with error code for truly unrecoverable errors
        // (like file system errors, template processing errors, etc.)
        if (error instanceof Error) {
            const errorMessage = error.message;
            // Check if this is a recoverable error that shouldn't cause exit
            const isRecoverableError = errorMessage.includes('Operation cancelled') ||
                errorMessage.includes('cancelled');
            if (isRecoverableError) {
                console.log('\n👋 Operation cancelled.');
                return; // Don't exit with error code
            }
            (0, interface_1.displayError)(`AI mode failed: ${errorMessage}`);
        }
        else {
            (0, interface_1.displayError)('AI mode failed with an unexpected error');
        }
        // Only exit with error code for unrecoverable errors
        process.exit(1);
    }
}
async function handleRevert() {
    try {
        const { prompt } = await Promise.resolve().then(() => __importStar(require('enquirer')));
        const response = await prompt({
            type: 'input',
            name: 'filepath',
            message: 'Enter the filepath to revert:',
            validate: (input) => input.trim().length > 0 || 'Filepath is required'
        });
        await (0, file_operations_1.restoreBackup)(response.filepath);
        console.log(`\n✅ Successfully reverted: ${response.filepath}`);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, interface_1.displayError)(`Failed to revert: ${error.message}`);
        }
        else {
            (0, interface_1.displayError)('Failed to revert file');
        }
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map