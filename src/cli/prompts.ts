/**
 * @description
 * desc
 *

 */

/**
 * @description
 * some desc
 *

 */

import { prompt } from 'enquirer';
import { TFileSearchResult, TDocstringTemplate, TDocstringData } from '../types';

// Enhanced color theme for better visual appeal
const colors = {
  primary: '\x1b[36m',    // cyan
  secondary: '\x1b[35m',  // magenta
  success: '\x1b[32m',    // green
  warning: '\x1b[33m',    // yellow
  info: '\x1b[34m',       // blue
  muted: '\x1b[90m',      // gray
  reset: '\x1b[0m',       // reset
  bold: '\x1b[1m',        // bold
  dim: '\x1b[2m'          // dim
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
  danger: '\x1b[31m',     // red
  strong: `${colors.bold}`,
  submitted: `${colors.success}${colors.bold}`
};

export async function promptForFile(files: TFileSearchResult[]): Promise<string> {
  if (files.length === 0) {
    throw new Error('No TypeScript files found in the current directory');
  }

  // Prioritize and limit files for better UX
  const prioritizeFiles = (files: TFileSearchResult[]) => {
    // Sort files: src/ files first, then root files, then others
    const sorted = files.sort((a, b) => {
      const aInSrc = a.relativePath.startsWith('src/');
      const bInSrc = b.relativePath.startsWith('src/');
      const aInRoot = !a.relativePath.includes('/');
      const bInRoot = !b.relativePath.includes('/');
      
      if (aInSrc && !bInSrc) return -1;
      if (!aInSrc && bInSrc) return 1;
      if (aInRoot && !bInRoot) return -1;
      if (!aInRoot && bInRoot) return 1;
      return a.relativePath.localeCompare(b.relativePath);
    });
    
    // If there are too many files, show a reasonable number
    if (sorted.length > 25) {
      return sorted.slice(0, 25);
    }
    return sorted;
  };
  
  const displayFiles = prioritizeFiles(files);
  const hasMoreFiles = files.length > displayFiles.length;
  
  // Simple choices - just the files without complex headers/separators
  const choices = displayFiles.map(file => ({
    name: file.relativePath,
    value: file.filepath
  }));
  
  // Add an option to show all files if we're limiting
  if (hasMoreFiles) {
    choices.push({
      name: `${colors.dim}... show all ${files.length} files${colors.reset}`,
      value: 'SHOW_ALL_FILES'
    });
  }

  try {
    const response = await prompt<{ file: string }>({
      type: 'autocomplete',
      name: 'file',
      message: `${colors.bold}${colors.primary}Select a TypeScript file:${colors.reset} ${colors.dim}💡 Type to search • Press Escape to quit${colors.reset}`,
      choices: choices,
      initial: 0
    });

    // Handle "show all files" option
    if (response.file === 'SHOW_ALL_FILES') {
      const allChoices = files.map(file => ({
        name: file.relativePath,
        value: file.filepath
      }));
      
      const allFilesResponse = await prompt<{ file: string }>({
        type: 'autocomplete',
        name: 'file',
        message: `${colors.bold}${colors.primary}Select from all ${files.length} files:${colors.reset} ${colors.dim}💡 Type to search • Press Escape to quit${colors.reset}`,
        choices: allChoices,
        initial: 0
      });
      
      return allFilesResponse.file;
    }

    return response.file;
  } catch (error) {
    // Handle cancellation (Escape key, Ctrl+C, etc.)
    if (!error || 
        (error instanceof Error && (
          error.message === '' || 
          error.message.includes('cancelled') || 
          error.message.includes('User force closed') ||
          error.message.includes('cancelled by user') ||
          error.message.includes('Aborted') ||
          error.message.includes('interrupted')
        )) ||
        (typeof error === 'string' && error === '')) {
      throw new Error('Operation cancelled by user');
    }
    throw error;
  }
}

export async function promptForTemplate(templates: TDocstringTemplate[]): Promise<string> {
  const choices = templates.map(template => ({
    name: template.name,
    value: template.name
  }));

  try {
    const response = await prompt<{ template: string }>({
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
  } catch (error) {
    // Handle cancellation (Escape key, Ctrl+C, etc.)
    if (!error || 
        (error instanceof Error && (
          error.message === '' || 
          error.message.includes('cancelled') || 
          error.message.includes('User force closed') ||
          error.message.includes('cancelled by user') ||
          error.message.includes('Aborted') ||
          error.message.includes('interrupted')
        )) ||
        (typeof error === 'string' && error === '')) {
      throw new Error('Operation cancelled by user');
    }
    throw error;
  }
}

export async function promptForDocstringData(): Promise<TDocstringData> {
  const questions = [
    {
      type: 'input',
      name: 'description',
      message: `${colors.bold}${colors.info}Enter description:${colors.reset}`,
      validate: (input: string) => input.trim().length > 0 || `${colors.warning}Description is required${colors.reset}`
    },
    {
      type: 'input',
      name: 'emoji',
      message: `${colors.bold}${colors.info}Enter emoji (optional):${colors.reset}`,
      validate: (input: string) => {
        if (!input.trim()) return true;
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
    const answers = await prompt(questions) as any;

    let author: string | undefined;
    if (answers.includeAuthor) {
      const authorResponse = await prompt<{ author: string }>({
        type: 'input',
        name: 'author',
        message: `${colors.bold}${colors.info}Enter author name:${colors.reset}`,
        validate: (input: string) => input.trim().length > 0 || `${colors.warning}Author name is required${colors.reset}`
      });
      author = authorResponse.author;
    }

    return {
      description: answers.description,
      emoji: answers.emoji || undefined,
      author
    };
  } catch (error) {
    // Handle cancellation (Escape key, Ctrl+C, etc.)
    if (!error || 
        (error instanceof Error && (
          error.message === '' || 
          error.message.includes('cancelled') || 
          error.message.includes('User force closed') ||
          error.message.includes('cancelled by user') ||
          error.message.includes('Aborted') ||
          error.message.includes('interrupted')
        )) ||
        (typeof error === 'string' && error === '')) {
      throw new Error('Operation cancelled by user');
    }
    throw error;
  }
}

