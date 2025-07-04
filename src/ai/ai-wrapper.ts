import fs from 'fs/promises';
import { generateDocumentation } from './ollama-service';
import { getConfig } from '../config/config-loader';
import type { TGeneratedDoc } from '../types';

/**
 * Wrapper function to generate docstring data from a TypeScript file using AI
 * @param filepath Path to the TypeScript file to analyze
 * @returns Generated docstring data
 */
export async function generateDocstringWithAI(filepath: string): Promise<TGeneratedDoc> {
  try {
    // Read the file content
    const sourceCode = await fs.readFile(filepath, 'utf-8');
    
    // Get config for Ollama model
    const config = getConfig();
    
    // Generate documentation using Ollama
    const generatedDoc = await generateDocumentation(sourceCode, {
      model: config.ollamaModel,
      maxDescriptionLength: config.maxDescriptionLength,
    });
    
    return generatedDoc;
  } catch (error) {
    console.error('AI Debug - Error details:', error);
    throw new Error(
      `Failed to generate docstring for ${filepath}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
