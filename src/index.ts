#!/usr/bin/env node

import { scanForTypeScriptFiles } from './fs/file-scanner';
import { loadTemplates } from './templates/template-loader';
import { processTemplate } from './core/template-processor';
import { hasExistingDocstring, injectDocstring } from './core/docstring-injector';
import { displayIntro, runInteractiveFlow, displaySuccess, displayError } from './cli/interface';
import { restoreBackup, removeBackup } from './fs/file-operations';
import path from 'path';

async function main(): Promise<void> {
  try {
    // Handle revert command
    if (process.argv.includes('--revert')) {
      await handleRevert();
      return;
    }

    // Display intro
    displayIntro();

    // Scan for TypeScript files
    console.log('🔍 Scanning for TypeScript files...\n');
    const files = await scanForTypeScriptFiles();

    if (files.length === 0) {
      displayError('No TypeScript files found in the current directory');
      return;
    }

    // Load templates
    console.log('📋 Loading templates...\n');
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
      displayError(error.message);
    } else {
      displayError('An unexpected error occurred');
    }
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
