# Docki

🚀 **AI-powered TypeScript docstring generator** - Add professional JSDoc comments to your TypeScript files with local AI or manual input.

## ✨ Demo

![Docki Demo](./assets/docki-demo.gif)

> **⚡ Watch Docki in action:** Beautiful ASCII interface, intelligent file scanning, AI-powered docstring generation, and seamless code integration - all in seconds!

## What it does

- **Scans** all `.ts` and `.tsx` files recursively from your current directory
- **Interactive selection** with arrow key navigation and fuzzy search
- **AI-powered generation** using local Ollama, or manual input as fallback
- **Multiple templates** for different documentation styles
- **Safe operations** with automatic backups before any changes

## Installation

```bash
npm install -g docki
```

## Usage

```bash
docki
```

## Requirements

- Node.js 16+
- TypeScript files (.ts, .tsx)
- Ollama (optional, for AI generation)

## Templates

- **Default**: Standard JSDoc format
- **Detailed**: Extended JSDoc with examples
- **Minimal**: Simple description-only format
- **Custom**: Define your own templates

## AI Integration

The CLI can integrate with Ollama for automatic docstring generation. If Ollama is not available, it gracefully falls back to manual input.

## Configuration

Create a `.docstring-cli.json` file in your project root:

```json
{
  "extensions": [".ts", ".tsx", ".js", ".jsx"],
  "excludeDirectories": ["node_modules", "dist", ".git"],
  "defaultTemplate": "jsdoc",
  "defaultAuthor": "Your Name",
  "ollamaModel": "codellama:7b",
  "maxDescriptionLength": 80
}
```

### Configuration Options

- **extensions**: File extensions to scan for (default: TypeScript files)
- **excludeDirectories**: Directories to ignore during scanning
- **defaultTemplate**: Template to use by default
- **defaultAuthor**: Your name to include in docstrings
- **ollamaModel**: AI model to use for generation (requires Ollama)
- **maxDescriptionLength**: Maximum line length for AI-generated descriptions (default: 80)

## License

MIT © [Remco Stoeten](https://github.com/remcostoeten)

