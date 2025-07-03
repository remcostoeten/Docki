/**
 * @description
 * TODO: AI-generated description
 *

 */

import { readFileContent, writeFileContent, createBackup } from '../fs/file-operations';

export async function hasExistingDocstring(filepath: string): Promise<boolean> {
  const content = await readFileContent(filepath);
  const trimmed = content.trim();
  return trimmed.startsWith('/**');
}

export async function injectDocstring(filepath: string, docstring: string): Promise<void> {
  await createBackup(filepath);
  
  const originalContent = await readFileContent(filepath);
  const formattedDocstring = docstring.endsWith('\n\n') ? docstring : docstring + '\n\n';
  const newContent = formattedDocstring + originalContent;
  
  await writeFileContent(filepath, newContent);
}

