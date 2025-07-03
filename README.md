# Docstring CLI 🚀

Easily add docstring intros with various templates interactively to your TypeScript files. Choose from manual input or let local AI (via Ollama) generate meaningful docstrings for your functions and classes.

## Features ✨

- 🔍 **Smart File Search** - Recursively scan and search through your TypeScript files
- 🤖 **AI-Powered Generation** - Local AI integration with Ollama for intelligent docstring creation
- 📋 **Template System** - Multiple docstring templates to choose from
- 💾 **Safe Operations** - Automatic backup before modifications with easy revert
- ⚙️ **Configurable** - Set default author, templates, and preferences
- 🎨 **Beautiful Interface** - Clean, colorful terminal UI with search capabilities

## Installation

```bash
npm install -g docstring-cli
```

## Usage

```bash
docstring
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
