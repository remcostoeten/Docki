import { exec } from 'child_process';
import { promisify } from 'util';
import type { TGeneratedDoc } from '../types/index';

const execAsync = promisify(exec);

export type TOllamaConfig = {
  model?: string;
  timeout?: number;
  maxDescriptionLength?: number;
};

const DEFAULT_MODEL = 'codellama:7b';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Loads the Ollama configuration with default values
 */
function loadOllamaConfig(config?: TOllamaConfig): Required<TOllamaConfig> {
  return {
    model: config?.model || DEFAULT_MODEL,
    timeout: config?.timeout || DEFAULT_TIMEOUT,
    maxDescriptionLength: config?.maxDescriptionLength || 80,
  };
}

/**
 * Checks if Ollama binary is available on the system
 */
async function checkOllamaBinary(): Promise<void> {
  try {
    await execAsync('which ollama', { timeout: 5000 });
  } catch (error) {
    throw new Error(
      'Ollama binary not found. Please install Ollama from https://ollama.ai or ensure it is in your PATH.'
    );
  }
}

/**
 * Checks if the specified Ollama model is available
 */
async function checkModelAvailability(model: string): Promise<void> {
  try {
    const { stdout } = await execAsync('ollama list', { timeout: 10000 });
    
    if (!stdout.includes(model)) {
      throw new Error(
        `Model "${model}" is not available. Please run "ollama pull ${model}" to download it, or choose a different model.`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not available')) {
      throw error;
    }
    throw new Error(
      `Failed to check model availability: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Wraps text to fit within specified line length
 */
function wrapText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
}

/**
 * Creates a structured prompt for generating documentation from TypeScript source code
 */
function createDocumentationPrompt(sourceCode: string, maxLength?: number): string {
  const lengthInstruction = maxLength 
    ? ` The description should be concise and fit within ${maxLength} characters per line.`
    : '';
    
  return `Read the following TypeScript file and return a concise one-sentence description and a single relevant emoji.${lengthInstruction} Respond as JSON with keys description and emoji.

TypeScript source code:
\`\`\`typescript
${sourceCode}
\`\`\`

Response (JSON only):`;
}

/**
 * Parses Ollama's response and extracts the generated documentation
 */
function parseOllamaResponse(response: string): TGeneratedDoc {
  try {
    // Clean the response - remove any non-JSON content
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Ollama response');
    }

    let jsonString = jsonMatch[0];
    
    // Fix common JSON issues with emoji values
    // Replace unquoted emoji values with quoted ones
    jsonString = jsonString.replace(/"emoji":\s*([^,}"\s]+)/g, '"emoji": "$1"');
    
    // Try to parse the cleaned JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, try to extract values manually
      console.warn('JSON parsing failed, attempting manual extraction');
      
      const descriptionMatch = response.match(/"description"\s*:\s*"([^"]+)"/i);
      const emojiMatch = response.match(/"emoji"\s*:\s*["']?([^,}"'\s]+)["']?/i);
      
      if (!descriptionMatch) {
        throw new Error('Could not extract description from response');
      }
      
      parsed = {
        description: descriptionMatch[1],
        emoji: emojiMatch ? emojiMatch[1] : undefined
      };
    }
    
    if (!parsed.description || typeof parsed.description !== 'string') {
      throw new Error('Invalid response format: missing or invalid description field');
    }

    const result: TGeneratedDoc = {
      description: parsed.description.trim(),
    };

    if (parsed.emoji && typeof parsed.emoji === 'string') {
      result.emoji = parsed.emoji.trim();
    }

    if (parsed.author && typeof parsed.author === 'string') {
      result.author = parsed.author.trim();
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse Ollama response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
    );
  }
}

/**
 * Sends a prompt to Ollama and returns the raw response
 */
async function sendPromptToOllama(
  prompt: string,
  model: string,
  timeout: number
): Promise<string> {
  try {
    // Escape all special shell characters properly
    const escapedPrompt = prompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'") 
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
    
    const command = `printf '%s' "${escapedPrompt}" | ollama run ${model}`;
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    if (stderr && stderr.trim()) {
      console.warn('Ollama stderr:', stderr);
    }

    if (!stdout || !stdout.trim()) {
      throw new Error('Ollama returned empty response');
    }

    return stdout.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error(`Ollama request timed out after ${timeout}ms. The model might be slow to respond.`);
      }
      if (error.message.includes('Command failed')) {
        throw new Error(`Failed to execute Ollama command: ${error.message}`);
      }
    }
    
    throw new Error(
      `Ollama execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Main function to generate documentation from TypeScript source code using Ollama
 */
export async function generateDocumentation(
  sourceCode: string,
  config?: TOllamaConfig
): Promise<TGeneratedDoc> {
  if (!sourceCode || !sourceCode.trim()) {
    throw new Error('Source code cannot be empty');
  }

  const ollamaConfig = loadOllamaConfig(config);

  // Validate environment
  await checkOllamaBinary();
  await checkModelAvailability(ollamaConfig.model);

  // Generate documentation
  const prompt = createDocumentationPrompt(sourceCode, ollamaConfig.maxDescriptionLength);
  const response = await sendPromptToOllama(
    prompt,
    ollamaConfig.model,
    ollamaConfig.timeout
  );

  const result = parseOllamaResponse(response);
  
  // Wrap the description if it's too long
  if (result.description && ollamaConfig.maxDescriptionLength) {
    result.description = wrapText(result.description, ollamaConfig.maxDescriptionLength);
  }

  return result;
}

/**
 * Validates Ollama setup and model availability
 */
export async function validateOllamaSetup(model?: string): Promise<boolean> {
  try {
    const targetModel = model || DEFAULT_MODEL;
    await checkOllamaBinary();
    await checkModelAvailability(targetModel);
    return true;
  } catch (error) {
    console.error('Ollama validation failed:', error instanceof Error ? error.message : error);
    return false;
  }
}
