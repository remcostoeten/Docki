import { TDocstringTemplate, TFileSearchResult, TCliPromptResult } from '../types';
import { promptForFile, promptForTemplate, promptForDocstringData } from './prompts';

export function displayIntro(): void {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ██████╗  ██████╗  ██████╗███████╗████████╗██████╗ ██╗███╗  ║
║    ██╔══██╗██╔═══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║████╗ ║
║    ██║  ██║██║   ██║██║     ███████╗   ██║   ██████╔╝██║██╔██╗║
║    ██║  ██║██║   ██║██║     ╚════██║   ██║   ██╔══██╗██║██║╚██║
║    ██████╔╝╚██████╔╝╚██████╗███████║   ██║   ██║  ██║██║██║ ╚█║
║    ╚═════╝  ╚═════╝  ╚═════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚╝
║                                                               ║
║               Docstring CLI - v1.0.0 - by @remcostoeten      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

💡 Navigation: Use arrow keys or VIM keys (j/k) to navigate
🔍 Search: Start typing to filter results
🚪 Exit: Press 'q' to quit at any time
📝 Back: Press backspace to go back one step

`);
}

export async function runInteractiveFlow(
  files: TFileSearchResult[],
  templates: TDocstringTemplate[]
): Promise<TCliPromptResult> {
  try {
    // Step 1: File selection
    const selectedFile = await promptForFile(files);

    // Step 2: Template selection
    const selectedTemplate = await promptForTemplate(templates);

    // Step 3: Docstring data collection
    const TDocstringData = await promptForDocstringData();

    return {
      selectedFile,
      selectedTemplate,
      TDocstringData
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      console.log('\n👋 Operation cancelled. Goodbye!');
      process.exit(0);
    }
    throw error;
  }
}

export function displaySuccess(filepath: string): void {
  console.log(`
✅ Success! File modified: ${filepath}

💡 To revert changes, run: docstring --revert
`);
}

export function displayError(error: string): void {
  console.log(`
❌ Error: ${error}
`);
}
