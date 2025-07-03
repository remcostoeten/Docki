"use strict";
/**
 * @description
 * desc
 *

 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptForFile = promptForFile;
exports.promptForTemplate = promptForTemplate;
exports.promptForDocstringData = promptForDocstringData;
/**
 * @description
 * some desc
 *

 */
const enquirer_1 = require("enquirer");
// Enhanced color theme for better visual appeal
const colors = {
    primary: '\x1b[36m', // cyan
    secondary: '\x1b[35m', // magenta
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    info: '\x1b[34m', // blue
    muted: '\x1b[90m', // gray
    reset: '\x1b[0m', // reset
    bold: '\x1b[1m', // bold
    dim: '\x1b[2m' // dim
};
// Custom theme for enquirer prompts
const promptTheme = {
    prefix: `${colors.primary}${colors.bold}?${colors.reset}`,
    separator: `${colors.muted}${colors.dim}›${colors.reset}`,
    pointer: `${colors.secondary}❯${colors.reset}`,
    disabled: `${colors.muted}${colors.dim}`,
    dark: `${colors.muted}`,
    success: `${colors.success}`,
    primary: `${colors.primary}`,
    secondary: `${colors.secondary}`,
    info: `${colors.info}`,
    warning: `${colors.warning}`,
    danger: '\x1b[31m', // red
    strong: `${colors.bold}`,
    submitted: `${colors.success}${colors.bold}`
};
async function promptForFile(files) {
    if (files.length === 0) {
        throw new Error('No TypeScript files found in the current directory');
    }
    // Simple choices - just the files without complex headers/separators
    const choices = files.map(file => ({
        name: file.relativePath,
        value: file.filepath
    }));
    try {
        const response = await (0, enquirer_1.prompt)({
            type: 'autocomplete',
            name: 'file',
            message: `${colors.bold}${colors.primary}Select a TypeScript file:${colors.reset} ${colors.dim}💡 Type to search • Press Escape to quit${colors.reset}`,
            choices: choices,
            initial: 0
        });
        return response.file;
    }
    catch (error) {
        // Handle cancellation (Escape key, Ctrl+C, etc.)
        if (!error ||
            (error instanceof Error && (error.message === '' ||
                error.message.includes('cancelled') ||
                error.message.includes('User force closed') ||
                error.message.includes('cancelled by user') ||
                error.message.includes('Aborted') ||
                error.message.includes('interrupted'))) ||
            (typeof error === 'string' && error === '')) {
            throw new Error('Operation cancelled by user');
        }
        throw error;
    }
}
async function promptForTemplate(templates) {
    const choices = templates.map(template => ({
        name: template.name,
        value: template.name
    }));
    try {
        const response = await (0, enquirer_1.prompt)({
            type: 'autocomplete',
            name: 'template',
            message: `${colors.bold}${colors.secondary}Select a docstring template:${colors.reset} ${colors.dim}💡 Type to search • Press Escape to quit${colors.reset}`,
            choices: choices.map(choice => ({
                ...choice,
                name: `${colors.success}${choice.name}${colors.reset}`
            })),
            initial: 0
        });
        return response.template;
    }
    catch (error) {
        // Handle cancellation (Escape key, Ctrl+C, etc.)
        if (!error ||
            (error instanceof Error && (error.message === '' ||
                error.message.includes('cancelled') ||
                error.message.includes('User force closed') ||
                error.message.includes('cancelled by user') ||
                error.message.includes('Aborted') ||
                error.message.includes('interrupted'))) ||
            (typeof error === 'string' && error === '')) {
            throw new Error('Operation cancelled by user');
        }
        throw error;
    }
}
async function promptForDocstringData() {
    const questions = [
        {
            type: 'input',
            name: 'description',
            message: `${colors.bold}${colors.info}Enter description:${colors.reset}`,
            validate: (input) => input.trim().length > 0 || `${colors.warning}Description is required${colors.reset}`
        },
        {
            type: 'input',
            name: 'emoji',
            message: `${colors.bold}${colors.info}Enter emoji (optional):${colors.reset}`,
            validate: (input) => {
                if (!input.trim())
                    return true;
                return input.trim().length <= 4 || `${colors.warning}Please enter a valid emoji${colors.reset}`;
            }
        },
        {
            type: 'confirm',
            name: 'includeAuthor',
            message: `${colors.bold}${colors.primary}Include @author tag?${colors.reset}`,
            initial: false
        }
    ];
    try {
        const answers = await (0, enquirer_1.prompt)(questions);
        let author;
        if (answers.includeAuthor) {
            const authorResponse = await (0, enquirer_1.prompt)({
                type: 'input',
                name: 'author',
                message: `${colors.bold}${colors.info}Enter author name:${colors.reset}`,
                validate: (input) => input.trim().length > 0 || `${colors.warning}Author name is required${colors.reset}`
            });
            author = authorResponse.author;
        }
        return {
            description: answers.description,
            emoji: answers.emoji || undefined,
            author
        };
    }
    catch (error) {
        // Handle cancellation (Escape key, Ctrl+C, etc.)
        if (!error ||
            (error instanceof Error && (error.message === '' ||
                error.message.includes('cancelled') ||
                error.message.includes('User force closed') ||
                error.message.includes('cancelled by user') ||
                error.message.includes('Aborted') ||
                error.message.includes('interrupted'))) ||
            (typeof error === 'string' && error === '')) {
            throw new Error('Operation cancelled by user');
        }
        throw error;
    }
}
//# sourceMappingURL=prompts.js.map