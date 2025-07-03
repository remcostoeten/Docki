/**
 * 📦 Get the current version from package.json
 * @author Remco Stoeten
 */
export declare function getVersion(): string;
/**
 * 📋 Parse semantic version into components
 * @author Remco Stoeten
 */
export declare function parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
};
/**
 * 🚀 Get version with appropriate emoji based on version number
 * @author Remco Stoeten
 */
export declare function getVersionWithEmoji(): string;
//# sourceMappingURL=version.d.ts.map