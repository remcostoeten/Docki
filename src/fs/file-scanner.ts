import glob from 'fast-glob';
import path from 'path';
import { TFileSearchResult } from '../types';

export async function scanForTypeScriptFiles(): Promise<TFileSearchResult[]> {
  const patterns = ['**/*.ts', '**/*.tsx'];
  const excludePatterns = [
    '**/node_modules/**',
    '**/.next/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.nuxt/**',
    '**/.output/**'
  ];

  const files = await glob(patterns, {
    ignore: excludePatterns,
    onlyFiles: true,
    absolute: true
  });

  return files.map(filepath => ({
    filepath,
    relativePath: path.relative(process.cwd(), filepath)
  }));
}

export async function checkFileExists(filepath: string): Promise<boolean> {
  const fs = await import('fs-extra');
  return fs.pathExists(filepath);
}

