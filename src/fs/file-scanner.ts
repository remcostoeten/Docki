import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';
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

  const filesWithStats = await Promise.all(
    files.map(async (filepath) => {
      try {
        const stats = await fs.promises.stat(filepath);
        return {
          filepath,
          relativePath: path.relative(process.cwd(), filepath),
          lastModified: stats.mtime
        };
      } catch (error) {
        // If we can't stat the file, include it without modification time
        return {
          filepath,
          relativePath: path.relative(process.cwd(), filepath),
          lastModified: new Date(0) // fallback to epoch
        };
      }
    })
  );

  // Sort by modification time, newest first
  return filesWithStats.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

export async function checkFileExists(filepath: string): Promise<boolean> {
  const fs = await import('fs-extra');
  return fs.pathExists(filepath);
}

