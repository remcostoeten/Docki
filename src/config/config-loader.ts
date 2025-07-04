import fs from 'fs';
import path from 'path';
import os from 'os';
import { TDocstringConfig } from '../types';

const defaultConfig: TDocstringConfig = {
  extensions: [], // Add default extensions if needed
  excludeDirectories: [], // Add default directories if needed
  ollamaModel: 'codellama:7b',
  maxDescriptionLength: 80, // Default maximum line length for descriptions
};

/**
 * Searches for the configuration file in the current working directory and home directory.
 * @returns The merged configuration object.
 */
export function getConfig(): TDocstringConfig {
  const cwdConfigPath = path.join(process.cwd(), 'docstring.config.json');
  const homeConfigPath = path.join(os.homedir(), 'docstring.config.json');

  let userConfig: Partial<TDocstringConfig> = {};

  if (fs.existsSync(cwdConfigPath)) {
    userConfig = JSON.parse(fs.readFileSync(cwdConfigPath, 'utf-8'));
  } else if (fs.existsSync(homeConfigPath)) {
    userConfig = JSON.parse(fs.readFileSync(homeConfigPath, 'utf-8'));
  }

  return { ...defaultConfig, ...userConfig };
}

