# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-07-03

### Added
- Initial release of docstring-cli
- Interactive TypeScript file selection with search functionality
- Multiple docstring templates (default, detailed, minimal)
- AI-powered docstring generation using Ollama and CodeLlama
- Automatic fallback to manual input when AI is unavailable
- Smart backup and restore functionality
- Configuration file support (.docstring-cli.json)
- Global CLI installation support
- Beautiful terminal UI with colors and progress indicators

### Features
- 🤖 **AI Integration**: Local AI generation with Ollama and CodeLlama
- 📋 **Template System**: Multiple built-in templates with custom template support
- 🔍 **Smart Search**: Fuzzy search through TypeScript files
- 💾 **Safe Operations**: Automatic backup with easy revert functionality
- ⚙️ **Configuration**: Customizable defaults and preferences
- 🎨 **Beautiful UI**: Clean terminal interface with visual feedback

### Supported File Types
- TypeScript (.ts)
- TypeScript React (.tsx)

### Installation
```bash
npm install -g docstring-cli
```

### Usage
```bash
# Interactive mode with AI
docstring

# Direct AI mode
docstring ai <filepath>

# Revert changes
docstring --revert
```
