import { TDocstringTemplate, TFileSearchResult, TCliPromptResult } from '../types';
export declare function displayIntro(): void;
export declare function runInteractiveFlow(files: TFileSearchResult[], templates: TDocstringTemplate[]): Promise<TCliPromptResult>;
export declare function displaySuccess(filepath: string): void;
export declare function displayError(error: string): void;
//# sourceMappingURL=interface.d.ts.map