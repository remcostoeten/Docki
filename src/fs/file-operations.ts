import fs from 'fs-extra';
import path from 'path';

export async function readFileContent(filepath: string): Promise<string> {
  return fs.readFile(filepath, 'utf-8');
}

export async function writeFileContent(filepath: string, content: string): Promise<void> {
  await fs.writeFile(filepath, content, 'utf-8');
}

export async function createBackup(filepath: string): Promise<string> {
  const backupPath = `${filepath}.docstring-backup`;
  await fs.copy(filepath, backupPath);
  return backupPath;
}

export async function restoreBackup(filepath: string): Promise<void> {
  const backupPath = `${filepath}.docstring-backup`;
  if (await fs.pathExists(backupPath)) {
    await fs.copy(backupPath, filepath);
    await fs.remove(backupPath);
  }
}

export async function removeBackup(filepath: string): Promise<void> {
  const backupPath = `${filepath}.docstring-backup`;
  if (await fs.pathExists(backupPath)) {
    await fs.remove(backupPath);
  }
}

