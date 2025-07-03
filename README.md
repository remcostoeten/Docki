# Docki

A simple command-line tool to add JSDoc comments to your TypeScript files. You can either type them in manually or have AI generate them for you using Ollama.

## What it does

- Scans your TypeScript files and lets you pick one
- Generates JSDoc comments automatically with AI, or you can write them yourself
- Includes several comment templates
- Makes backups before changing anything
- Works entirely offline (no cloud AI services)

## Installation

```bash
npm install -g docki
```

## Usage

```bash
docki
```

The CLI will guide you through:
1. Selecting a TypeScript file from your project
2. Choosing a docstring template
3. Either generating content with AI or entering it manually
4. Reviewing and applying the changes

## Requirements

- Node.js 16+
- TypeScript files (.ts, .tsx)
- Ollama (optional, for AI generation)

## Supported File Types

- TypeScript (.ts)
- TypeScript React (.tsx)

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
  "defaultAuthor": "Your Name",
  "defaultTemplate": "default",
  "aiEnabled": true
}
```

## License

MIT © [Remco Stoeten](https://github.com/remcostoeten)


---

This project was renamed from docstring-cli to Docki.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
