#!/usr/bin/env node

import path from 'path';
import { scanForTypeScriptFiles } from './fs/file-scanner';
import { loadTemplates } from './templates/template-loader';
import { processTemplate } from './core/template-processor';
import { hasExistingDocstring, injectDocstring } from './core/docstring-injector';
import { displayIntro, runInteractiveFlow, displaySuccess, displayError } from './cli/interface';
import { promptForDocstringData, promptForTemplate } from './cli/prompts';
import { restoreBackup, removeBackup } from './fs/file-operations';
import { generateDocstringWithAI } from './ai/ai-wrapper';
import { getConfig } from './config/config-loader';
import type { TDocstringData, TDocstringTemplate } from './types';

// Colors for console output
const colors = {
  secondary: '\x1b[35m',  // magenta
  muted: '\x1b[90m',      // gray
  reset: '\x1b[0m'        // reset
};

// Enhanced color scheme for help menu
const helpColors = {
  primary: '\x1b[36m',     // cyan
  secondary: '\x1b[35m',   // magenta  
  success: '\x1b[32m',     // green
  warning: '\x1b[33m',     // yellow
  info: '\x1b[34m',        // blue
  muted: '\x1b[90m',       // gray
  bright: '\x1b[97m',      // bright white
  reset: '\x1b[0m',        // reset
  bold: '\x1b[1m',         // bold
  dim: '\x1b[2m',          // dim
  underline: '\x1b[4m'     // underline
};

// Displays help information
function displayHelp(): void {
  console.log(`
${helpColors.primary}${helpColors.bold}╔══════════════════════════════════════════════════════════════════════════════╗${helpColors.reset}
${helpColors.primary}║${helpColors.reset}                               ${helpColors.bright}${helpColors.bold}🚀 DOCKI HELP${helpColors.reset}                               ${helpColors.primary}║${helpColors.reset}
${helpColors.primary}║${helpColors.reset}           ${helpColors.muted}Simple CLI to add JSDoc comments to TypeScript files${helpColors.reset}           ${helpColors.primary}║${helpColors.reset}
${helpColors.primary}╚══════════════════════════════════════════════════════════════════════════════╝${helpColors.reset}

${helpColors.secondary}${helpColors.bold}📋 USAGE${helpColors.reset}
${helpColors.muted}────────${helpColors.reset}
  ${helpColors.success}${helpColors.bold}docki${helpColors.reset}                     ${helpColors.muted}Interactive mode (scan files, choose template)${helpColors.reset}
  ${helpColors.success}${helpColors.bold}docki ai${helpColors.reset} ${helpColors.info}<filepath>${helpColors.reset}       ${helpColors.muted}AI mode (generate docstring for specific file)${helpColors.reset}
  ${helpColors.success}${helpColors.bold}docki --help${helpColors.reset}, ${helpColors.success}-h${helpColors.reset}          ${helpColors.muted}Display this help message${helpColors.reset}
  ${helpColors.success}${helpColors.bold}docki --version${helpColors.reset}, ${helpColors.success}-v${helpColors.reset}       ${helpColors.muted}Display version information${helpColors.reset}
  ${helpColors.success}${helpColors.bold}docki --revert${helpColors.reset}            ${helpColors.muted}Revert changes made to a file${helpColors.reset}

${helpColors.secondary}${helpColors.bold}🎯 MODES${helpColors.reset}
${helpColors.muted}─────────${helpColors.reset}
  ${helpColors.warning}${helpColors.bold}🔍 Interactive Mode${helpColors.reset} ${helpColors.dim}(default)${helpColors.reset}
    ${helpColors.muted}•${helpColors.reset} Scans your project for TypeScript files
    ${helpColors.muted}•${helpColors.reset} Lets you choose which file to document
    ${helpColors.muted}•${helpColors.reset} Tries AI first, falls back to manual input if AI unavailable
    ${helpColors.muted}•${helpColors.reset} ${helpColors.success}Best for exploring your codebase${helpColors.reset}

  ${helpColors.warning}${helpColors.bold}🤖 AI Mode${helpColors.reset} ${helpColors.dim}(docki ai <filepath>)${helpColors.reset}
    ${helpColors.muted}•${helpColors.reset} Directly processes a specific file
    ${helpColors.muted}•${helpColors.reset} Skips file selection
    ${helpColors.muted}•${helpColors.reset} Uses AI if available, otherwise prompts for manual input
    ${helpColors.muted}•${helpColors.reset} ${helpColors.success}Best when you know exactly which file to document${helpColors.reset}

${helpColors.secondary}${helpColors.bold}🧠 AI vs MANUAL${helpColors.reset}
${helpColors.muted}─────────────────${helpColors.reset}
  ${helpColors.info}${helpColors.bold}✨ Use AI when:${helpColors.reset}
    ${helpColors.success}✓${helpColors.reset} You have Ollama installed and running
    ${helpColors.success}✓${helpColors.reset} You want quick, contextual docstrings
    ${helpColors.success}✓${helpColors.reset} The function/class is complex and you want smart analysis
    ${helpColors.success}✓${helpColors.reset} You're documenting many files and want consistency

  ${helpColors.info}${helpColors.bold}✏️  Use Manual when:${helpColors.reset}
    ${helpColors.warning}•${helpColors.reset} You don't have Ollama installed
    ${helpColors.warning}•${helpColors.reset} You want specific, custom documentation
    ${helpColors.warning}•${helpColors.reset} You know exactly what the docstring should say
    ${helpColors.warning}•${helpColors.reset} You're working with domain-specific code that needs precise docs

${helpColors.secondary}${helpColors.bold}💡 EXAMPLES${helpColors.reset}
${helpColors.muted}──────────────${helpColors.reset}
  ${helpColors.success}docki${helpColors.reset}                         ${helpColors.muted}# Interactive mode${helpColors.reset}
  ${helpColors.success}docki ai${helpColors.reset} ${helpColors.info}src/utils/parser.ts${helpColors.reset}  ${helpColors.muted}# AI mode for specific file${helpColors.reset}
  ${helpColors.success}docki --revert${helpColors.reset}               ${helpColors.muted}# Revert previous changes${helpColors.reset}

${helpColors.secondary}${helpColors.bold}⚙️  CONFIGURATION${helpColors.reset}
${helpColors.muted}────────────────────${helpColors.reset}
  Create ${helpColors.info}${helpColors.bold}.docstring-cli.json${helpColors.reset} in your project root:
  ${helpColors.dim}{
    "defaultAuthor": "Your Name",
    "defaultTemplate": "default",
    "aiEnabled": true
  }${helpColors.reset}

${helpColors.secondary}${helpColors.bold}🔗 LINKS${helpColors.reset}
${helpColors.muted}─────────${helpColors.reset}
  ${helpColors.info}${helpColors.underline}https://github.com/remcostoeten/docki${helpColors.reset}

${helpColors.muted}${helpColors.dim}Made with ❤️  by @remcostoeten${helpColors.reset}
`);
}

// Displays version information
function displayVersion(): void {
  const packageJson = require('../package.json');
  console.log(`\nDocki version: ${packageJson.version}`);
}

// Display usage hint
function displayUsageHint(): void {
  console.log(`Run 'docki --help' for usage information.`);
}

async function main(): Promise<void> {
  try {
    // Handle help command
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      displayHelp();
      return;
    }

    // Handle version command
    if (process.argv.includes('--version') || process.argv.includes('-v')) {
      displayVersion();
      return;
    }

    // Handle revert command
    if (process.argv.includes('--revert')) {
      await handleRevert();
      return;
    }

    // Handle AI mode: docstring ai <filepath>
    if (process.argv[2] === 'ai') {
      const filepath = process.argv[3];
      if (!filepath) {
        displayError('Filepath is required when using AI mode. Usage: docstring ai <filepath>');
        displayUsageHint();
        return;
      }
      await handleAiMode(filepath);
      return;
    }

    // Display intro
    displayIntro();

    // Scan for TypeScript files
    console.log('🔍 Scanning files...');
    const files = await scanForTypeScriptFiles();

    if (files.length === 0) {
      displayError('No TypeScript files found in the current directory');
      return;
    }

    // Load templates
    console.log('📋 Loading templates...');
    const templates = await loadTemplates();

    // Run interactive flow
    const result = await runInteractiveFlow(files, templates);

    // Check for existing docstring
    if (await hasExistingDocstring(result.selectedFile)) {
      console.log('\n⚠️  Warning: File already contains a docstring at the beginning');
      const { prompt } = await import('enquirer');
      const response = await prompt<{ continue: boolean }>({
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
      displayError('Selected template not found');
      return;
    }

    // Process template
    const processed = processTemplate(selectedTemplate, result.TDocstringData);

    // Inject docstring
    await injectDocstring(result.selectedFile, processed.content);

    // Clean up backup on success
    await removeBackup(result.selectedFile);

    // Display success message
    displaySuccess(path.relative(process.cwd(), result.selectedFile));

  } catch (error) {
    if (error instanceof Error) {
      // Check if this is a user cancellation
      if (error.message.includes('Operation cancelled by user') || error.message.includes('cancelled')) {
        console.log(`\n${colors.secondary}👋${colors.reset} ${colors.muted}Operation cancelled. Goodbye!${colors.reset}`);
        process.exit(0);
      }
      displayError(error.message);
    } else {
      displayError('An unexpected error occurred');
    }
    process.exit(1);
  }
}

async function handleAiMode(filepath: string): Promise<void> {
  try {
    // Validate file exists and is a TypeScript file
    const fs = await import('fs/promises');
    
    try {
      await fs.access(filepath);
    } catch {
      displayError(`File not found: ${filepath}`);
      return;
    }

    if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx')) {
      displayError('File must be a TypeScript file (.ts or .tsx)');
      return;
    }

    // Check for existing docstring
    if (await hasExistingDocstring(filepath)) {
      displayError('File already contains a docstring. Use --revert to remove it first.');
      return;
    }

    console.log('🤖 Generating docstring with AI...\n');
    
    let aiOutput: any;
    let fallbackToManual = false;
    
    try {
      // Generate docstring using AI
      aiOutput = await generateDocstringWithAI(filepath);
    } catch (error) {
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
      } else {
        // For non-Ollama errors, still throw to maintain original error handling
        throw error;
      }
    }
    
    // Get config to check for default author
    const config = getConfig();
    
    let docstringData: TDocstringData;
    
    if (fallbackToManual) {
      // Fall back to interactive prompts for docstring data
      console.log('📝 Please provide docstring information manually:\n');
      docstringData = await promptForDocstringData();
    } else {
      // Construct TDocstringData using AI output
      docstringData = {
        description: aiOutput.description,
        emoji: aiOutput.emoji,
        author: config.defaultAuthor || aiOutput.author
      };
    }

    // Load templates
    console.log('📋 Loading templates...');
    const templates = await loadTemplates();

    let selectedTemplate: TDocstringTemplate;
    
    if (fallbackToManual) {
      // Let user select template interactively
      const templateName = await promptForTemplate(templates);
      selectedTemplate = templates.find(t => t.name === templateName)!;
    } else {
      // Auto-select default template if set, else use first available
      if (config.defaultTemplate) {
        const defaultTemplate = templates.find(t => t.name === config.defaultTemplate);
        if (defaultTemplate) {
          selectedTemplate = defaultTemplate;
          console.log(`✅ Using default template: ${config.defaultTemplate}`);
        } else {
          console.log(`⚠️  Default template '${config.defaultTemplate}' not found, using first available template`);
          selectedTemplate = templates[0];
        }
      } else {
        // No default template set, use first available
        selectedTemplate = templates[0];
      }
    }
    
    if (!selectedTemplate) {
      displayError('No templates found');
      return;
    }

    // Process template
    const processed = processTemplate(selectedTemplate, docstringData);

    // Inject docstring (this creates backup automatically)
    await injectDocstring(filepath, processed.content);

    // Clean up backup on success
    await removeBackup(filepath);

    // Display success message
    displaySuccess(path.relative(process.cwd(), filepath));
    if (fallbackToManual) {
      console.log('\n✅ Docstring added successfully using manual input!');
    } else {
      console.log('\n🤖 AI-generated docstring added successfully!');
    }

  } catch (error) {
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
      
      displayError(`AI mode failed: ${errorMessage}`);
    } else {
      displayError('AI mode failed with an unexpected error');
    }
    
    // Only exit with error code for unrecoverable errors
    process.exit(1);
  }
}

async function handleRevert(): Promise<void> {
  try {
    const { prompt } = await import('enquirer');
    const response = await prompt<{ filepath: string }>({
      type: 'input',
      name: 'filepath',
      message: 'Enter the filepath to revert:',
      validate: (input: string) => input.trim().length > 0 || 'Filepath is required'
    });

    await restoreBackup(response.filepath);
    console.log(`\n✅ Successfully reverted: ${response.filepath}`);
  } catch (error) {
    if (error instanceof Error) {
      displayError(`Failed to revert: ${error.message}`);
    } else {
      displayError('Failed to revert file');
    }
  }
}

if (require.main === module) {
  main();
}

export { main };
