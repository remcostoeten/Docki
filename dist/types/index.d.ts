export type TDocstringTemplate = {
    name: string;
    content: string;
    filepath: string;
};
export type TDocstringData = {
    description: string;
    emoji?: string;
    author?: string;
};
export type TProcessedTemplate = {
    content: string;
    tokens: TTemplateToken[];
};
export type TTemplateToken = {
    token: string;
    value: string;
};
export type TFileSearchResult = {
    filepath: string;
    relativePath: string;
    lastModified: Date;
};
export type TCliPromptResult = {
    selectedFile: string;
    selectedTemplate: string;
    TDocstringData: TDocstringData;
};
export type TDocstringConfig = {
    extensions: string[];
    excludeDirectories: string[];
    defaultTemplate?: string;
    defaultAuthor?: string;
    ollamaModel?: string;
};
export type TGeneratedDoc = {
    description: string;
    emoji?: string;
    author?: string;
};
//# sourceMappingURL=index.d.ts.map