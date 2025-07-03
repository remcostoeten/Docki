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
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayIntro = displayIntro;
exports.runInteractiveFlow = runInteractiveFlow;
exports.displaySuccess = displaySuccess;
exports.displayError = displayError;
const prompts_1 = require("./prompts");
const version_1 = require("../utils/version");
// Enhanced color scheme for better visual appeal
const colors = {
    primary: '\x1b[36m', // cyan
    secondary: '\x1b[35m', // magenta
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    info: '\x1b[34m', // blue
    muted: '\x1b[90m', // gray
    reset: '\x1b[0m', // reset
    bold: '\x1b[1m', // bold
    dim: '\x1b[2m', // dim
    bright: '\x1b[97m' // bright white
};
function displayIntro() {
    console.clear();
    console.log(`
${colors.primary}${colors.bold}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.primary}║${colors.reset}                                                               ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}██████╗  ██████╗  ██████╗███████╗████████╗██████╗ ██╗███╗${colors.reset}  ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}██╔══██╗██╔═══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║████╗${colors.reset} ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}██║  ██║██║   ██║██║     ███████╗   ██║   ██████╔╝██║██╔██╗${colors.reset}${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}██║  ██║██║   ██║██║     ╚════██║   ██║   ██╔══██╗██║██║╚██${colors.reset}${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}██████╔╝╚██████╔╝╚██████╗███████║   ██║   ██║  ██║██║██║ ╚█${colors.reset}${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}    ${colors.secondary}${colors.bold}╚═════╝  ╚═════╝  ╚═════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚╝${colors.reset} ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}                                                               ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}               ${colors.info}${colors.bold}Docstring CLI - ${(0, version_1.getVersionWithEmoji)()} - by @remcostoeten${colors.reset}      ${colors.primary}║${colors.reset}
${colors.primary}║${colors.reset}                                                               ${colors.primary}║${colors.reset}
${colors.primary}${colors.bold}╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.muted}Navigation: ${colors.reset}${colors.bold}↑↓${colors.reset} ${colors.muted}• Search: ${colors.reset}${colors.bold}type${colors.reset} ${colors.muted}• Exit: ${colors.reset}${colors.bold}Escape${colors.reset}

`);
}
async function runInteractiveFlow(files, templates) {
    try {
        // Step 1: File selection
        const selectedFile = await (0, prompts_1.promptForFile)(files);
        // Step 2: Try AI first, then fallback to manual
        console.log('\n🤖 Attempting to generate docstring with AI...\n');
        const { generateDocstringWithAI } = await Promise.resolve().then(() => __importStar(require('../ai/ai-wrapper')));
        const { getConfig } = await Promise.resolve().then(() => __importStar(require('../config/config-loader')));
        let aiOutput;
        let fallbackToManual = false;
        try {
            // Generate docstring using AI
            aiOutput = await generateDocstringWithAI(selectedFile);
            console.log(`${colors.success}✅ AI generated docstring successfully!${colors.reset}\n`);
        }
        catch (error) {
            // Check if this is an Ollama-related error
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isOllamaError = errorMessage.includes('Ollama') ||
                errorMessage.includes('binary not found') ||
                errorMessage.includes('not available') ||
                errorMessage.includes('Failed to execute Ollama') ||
                errorMessage.includes('timeout');
            if (isOllamaError) {
                console.log(`${colors.warning}⚠️  Local AI unavailable – falling back to manual input${colors.reset}\n`);
                fallbackToManual = true;
            }
            else {
                // For non-Ollama errors, still throw to maintain original error handling
                throw error;
            }
        }
        // Get config for default values
        const config = getConfig();
        let selectedTemplate;
        let TDocstringData;
        if (fallbackToManual) {
            // Step 2: Template selection (manual mode)
            selectedTemplate = await (0, prompts_1.promptForTemplate)(templates);
            // Step 3: Docstring data collection (manual mode)
            TDocstringData = await (0, prompts_1.promptForDocstringData)();
        }
        else {
            // AI mode: auto-select template and use AI-generated data
            if (config.defaultTemplate) {
                const defaultTemplate = templates.find(t => t.name === config.defaultTemplate);
                if (defaultTemplate) {
                    selectedTemplate = config.defaultTemplate;
                    console.log(`${colors.info}📋 Using default template: ${config.defaultTemplate}${colors.reset}\n`);
                }
                else {
                    console.log(`${colors.warning}⚠️  Default template '${config.defaultTemplate}' not found, using first available template${colors.reset}\n`);
                    selectedTemplate = templates[0].name;
                }
            }
            else {
                // No default template set, use first available
                selectedTemplate = templates[0].name;
                console.log(`${colors.info}📋 Using template: ${selectedTemplate}${colors.reset}\n`);
            }
            // Construct TDocstringData using AI output
            TDocstringData = {
                description: aiOutput.description,
                emoji: aiOutput.emoji,
                author: config.defaultAuthor || aiOutput.author
            };
            // Show what AI generated
            console.log(`${colors.info}🎯 Generated:${colors.reset}`);
            console.log(`${colors.muted}   Description: ${colors.reset}${TDocstringData.description}`);
            if (TDocstringData.emoji) {
                console.log(`${colors.muted}   Emoji: ${colors.reset}${TDocstringData.emoji}`);
            }
            if (TDocstringData.author) {
                console.log(`${colors.muted}   Author: ${colors.reset}${TDocstringData.author}`);
            }
            console.log('');
        }
        return {
            selectedFile,
            selectedTemplate,
            TDocstringData
        };
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('cancelled')) {
            console.log(`\n${colors.secondary}👋${colors.reset} ${colors.muted}Operation cancelled. Goodbye!${colors.reset}`);
            process.exit(0);
        }
        throw error;
    }
}
function displaySuccess(filepath) {
    console.log(`
${colors.success}${colors.bold}✅ Success!${colors.reset} File modified: ${colors.info}${filepath}${colors.reset}

${colors.info}💡${colors.reset} ${colors.muted}To revert changes, run:${colors.reset} ${colors.primary}${colors.bold}docstring --revert${colors.reset}
`);
}
function displayError(error) {
    console.log(`
${colors.warning}${colors.bold}❌ Error:${colors.reset} ${error}
`);
}
//# sourceMappingURL=interface.js.map