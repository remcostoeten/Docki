# Docki

A simple command-line tool to add JSDoc comments to your TypeScript files. You can either type them in manually or have AI generate them for you using Ollama.

## What it does

- Indexes all `.ts` and `.tsx` files recursive from the directory you run it from
- Shows all files, allows you to select by navigating via arrow or filtering via fuzzysearch.
-Prompts for @description, or whatever you define via templates or let AI do the job
- Includes several comment templates
- Makes backups before changing anything

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
  "defaultAuthor": "Your Name",
  "defaultTemplate": "default",
  "aiEnabled": true
}
```

xxx,

Remco Stoeten

