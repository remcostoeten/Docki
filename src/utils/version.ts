import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 📦 Get the current version from package.json
 * @author Remco Stoeten
 */
export function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    // Fallback version if package.json can't be read
    return '0.0.1';
  }
}

/**
 * 📋 Parse semantic version into components
 * @author Remco Stoeten
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } {
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
  const match = version.match(versionRegex);
  
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4]
  };
}

/**
 * 🚀 Get version with appropriate emoji based on version number
 * @author Remco Stoeten
 */
export function getVersionWithEmoji(): string {
  const version = getVersion();
  const parsed = parseVersion(version);
  
  // Different emojis for different version stages
  if (parsed.prerelease) {
    return `🚧 v${version}`; // Construction/WIP for prereleases
  } else if (parsed.major === 0) {
    if (parsed.minor === 0) {
      return `🌱 v${version}`; // Seedling for early development (0.0.x)
    } else {
      return `🌿 v${version}`; // Herb for minor development (0.x.x)
    }
  } else {
    return `🚀 v${version}`; // Rocket for stable releases (1.x.x+)
  }
}
