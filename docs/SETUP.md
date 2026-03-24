# WZRD.dev CLI Setup Guide

This guide explains how to install and configure the WZRD.dev CLI (`opencode-wzrd`).

## What Is This?

WZRD.dev CLI is a standalone command-line tool that provides the Remi v2 AI agent with:
- Auto-mode detection (CHAT, CODER, DEBUG, TESTING, PLANNING, RESEARCH, DOCUMENTATION, REVIEW)
- PIV orchestration (Plan→Implement→Validate for complex tasks)
- Automatic skill loading
- Memory system with conversation persistence
- Gold standard enforcement

## Installation

### Option 1: NPM (Recommended)

```bash
npm install -g opencode-wzrd@latest
```

### Option 2: One-Liner Script

```bash
curl -s https://raw.githubusercontent.com/mdthewzrd/opencodewzrd/main/install.sh | bash
```

### Option 3: Clone & Build

```bash
git clone https://github.com/mdthewzrd/opencodewzrd.git
cd opencodewzrd
npm install
npm run build
npm link
```

## Verification

```bash
# Check version
wzrd --version

# Show help
wzrd --help

# Test with a simple command
wzrd chat "Hello"
```

## Configuration

Run the setup command:

```bash
wzrd setup
```

This creates `~/.wzrd/config.json`:

```json
{
  "autoModeDetection": true,
  "enableAutoPIV": true,
  "enableAutoSkills": true,
  "enableGoldStandard": true,
  "enableMemory": true,
  "memoryMaxResults": 5,
  "memoryCompressionThreshold": 4000,
  "logLevel": "info"
}
```

## Usage

### Basic Commands

```bash
# Start with auto-mode detection
wzrd chat "Your message here"

# List available modes
wzrd modes

# Show loaded skills
wzrd skills

# Check memory stats
wzrd memory stats
```

### Mode Detection Examples

```bash
# Auto-detects CODER mode
$ wzrd chat "Write a Python function"
[CODER MODE]

# Auto-detects DEBUG mode
$ wzrd chat "Fix this error"
[DEBUG MODE]

# Triggers PIV (complex task)
$ wzrd chat "Design and build a new feature"
[PLANNING MODE] | PIV Orchestrated
```

## OpenCode Integration

If you also use OpenCode, the WZRD.dev CLI can work alongside it:

1. Install both tools:
   ```bash
   npm install -g opencode
   npm install -g opencode-wzrd
   ```

2. Use OpenCode for IDE integration
3. Use `wzrd` CLI for terminal-based workflows

## Troubleshooting

### Command Not Found

If `wzrd` is not found after installation:

```bash
# Check npm global bin is in PATH
npm bin -g

# Or use npx
npx opencode-wzrd chat "Hello"
```

### Configuration Issues

Reset to defaults:

```bash
rm ~/.wzrd/config.json
wzrd setup
```

### Memory/Performance

Check memory usage:

```bash
wzrd memory stats
```

Clear memory cache:

```bash
rm -rf ~/.wzrd/memory/
```

## File Structure

```
~/.wzrd/
├── config.json          # Configuration
└── memory/               # Conversation memory
    ├── conversations/
    ├── patterns/
    └── cache/
```

## Updating

```bash
npm update -g opencode-wzrd
```

## Uninstallation

```bash
npm uninstall -g opencode-wzrd
rm -rf ~/.wzrd/
```

## See Also

- [Main README](../README.md) - Full documentation
- [GitHub Repository](https://github.com/mdthewzrd/opencodewzrd)
- [NPM Package](https://npmjs.com/package/opencode-wzrd)
