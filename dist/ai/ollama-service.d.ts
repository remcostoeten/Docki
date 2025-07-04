import type { TGeneratedDoc } from '../types/index';
export type TOllamaConfig = {
    model?: string;
    timeout?: number;
    maxDescriptionLength?: number;
};
/**
 * Main function to generate documentation from TypeScript source code using Ollama
 */
export declare function generateDocumentation(sourceCode: string, config?: TOllamaConfig): Promise<TGeneratedDoc>;
/**
 * Validates Ollama setup and model availability
 */
export declare function validateOllamaSetup(model?: string): Promise<boolean>;
//# sourceMappingURL=ollama-service.d.ts.map