# WZRD.dev Remi v2 - OpenCode Extension

![WZRD.dev](https://img.shields.io/badge/WZRD.dev-AI%20Agent-blue)
![OpenCode](https://img.shields.io/badge/OpenCode-Extension-green)
![Version](https://img.shields.io/npm/v/opencode-wzrd)
![License](https://img.shields.io/npm/l/opencode-wzrd)

**Remi v2**: Auto-capable AI agent for OpenCode with automatic mode detection, PIV orchestration, and skill loading.

## ✨ What's New in v2

- **Auto-Gold-Standard**: Automatic file verification and attempt tracking
- **Auto-PIV**: Plan→Implement→Validate orchestration for complex tasks
- **Auto-Skills**: 20+ keyword mappings with priority loading
- **9 Modes**: CHAT, CODER, DEBUG, TESTING, PLANNING, RESEARCH, DOCUMENTATION, REVIEW
- **2.2M+ ops/sec**: Stress-tested performance

## 🚀 Installation

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

## 📦 Features

### Auto-Mode Detection

Remi automatically detects the right mode from your input:

| Input Pattern | Mode | Example |
|--------------|------|---------|
| "Hi", "Hello" | CHAT | "Hi there!" |
| "Write code", "Implement" | CODER | "Write a React component" |
| "Error", "Bug", "Fix" | DEBUG | "Fix this error" |
| "Test", "Validate" | TESTING | "Test the API" |
| "Design", "Plan", "Architecture" | PLANNING | "Design a database schema" |
| "Research", "Compare" | RESEARCH | "Research best practices" |
| "Document", "README" | DOCUMENTATION | "Write API docs" |
| "Review", "Audit" | REVIEW | "Review this code" |

### Auto-PIV Orchestration

Complex tasks automatically trigger Plan→Implement→Validate workflow:

```bash
# Triggers PIV (multiple signals)
wzrd "Design and implement a new authentication system with testing"

# Simple task (no PIV)
wzrd "Fix the typo in readme"
```

### Auto-Skill Loading

Skills load automatically based on keywords:

- **P0 (Immediate)**: testing, debugging, security
- **P1 (On mode enter)**: coding, research, documentation
- **P2 (On demand)**: architecture, performance

## 🎯 Usage

### CLI

```bash
# Start with auto-mode detection
wzrd chat "Your message here"

# List available modes
wzrd modes

# Show loaded skills
wzrd skills

# Setup configuration
wzrd setup
```

### OpenCode Integration

1. Install the extension in OpenCode
2. Use command palette: `Cmd/Ctrl + Shift + P`
3. Type "Remi" for WZRD.dev commands

### Examples

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

## 🔧 Configuration

```bash
wzrd setup
```

Creates `~/.wzrd/config.json`:

```json
{
  "autoModeDetection": true,
  "enableAutoPIV": true,
  "enableAutoSkills": true,
  "enableGoldStandard": true,
  "logLevel": "info"
}
```

## 📁 Project Structure

```
opencodewzrd/
├── src/
│   ├── index.ts              # Main entry
│   ├── agent.ts              # Core agent
│   ├── cli.ts                # CLI interface
│   ├── auto-core/            # Auto-capabilities
│   │   ├── index.ts          # Core systems
│   │   ├── integration.ts    # Integration layer
│   │   └── opencode-adapter.ts
│   └── types.ts
├── skills/                   # Bundled skills
├── dist/                     # Compiled output
├── package.json
└── README.md
```

## 🛠️ Development

### Prerequisites

- Node.js 16+
- TypeScript 5.0+

### Build

```bash
npm install
npm run build
npm test
```

## 📄 License

MIT © [WZRD.dev](https://wzrd.dev)

## 🔗 Links

- [GitHub](https://github.com/mdthewzrd/opencodewzrd)
- [NPM](https://npmjs.com/package/opencode-wzrd)
- [Issues](https://github.com/mdthewzrd/opencodewzrd/issues)

---

**Built with ❤️ by WZRD.dev**
