import fs from 'fs-extra';
import path from 'path';
import { TDocstringTemplate } from '../types';

export async function loadTemplates(): Promise<TDocstringTemplate[]> {
  const templatesDir = path.join(__dirname, '../../templates');

  await fs.ensureDir(templatesDir);

  const files = await fs.readdir(templatesDir);
  const templateFiles = files.filter(file => file.endsWith('.txt'));

  if (templateFiles.length === 0) {
    await createDefaultTemplate(templatesDir);
    return loadTemplates();
  }

  const templates: TDocstringTemplate[] = [];

  for (const file of templateFiles) {
    const filepath = path.join(templatesDir, file);
    const content = await fs.readFile(filepath, 'utf-8');
    const name = path.basename(file, '.txt');

    templates.push({
      name,
      content,
      filepath
    });
  }

  return templates;
}

async function createDefaultTemplate(templatesDir: string): Promise<void> {
  const defaultTemplate = `/**
 * @description
 * $DESCRIPTION
 *
$EMOJI_LINE$AUTHOR_LINE
 */`;

  await fs.writeFile(
    path.join(templatesDir, 'default.txt'),
    defaultTemplate,
    'utf-8'
  );
}

