# WZRD.dev OpenCode Extension

![WZRD.dev](https://img.shields.io/badge/WZRD.dev-AI%20Agent-blue)
![OpenCode](https://img.shields.io/badge/OpenCode-Extension-green)
![Version](https://img.shields.io/npm/v/@wzrddev/opencode-remi)
![License](https://img.shields.io/npm/l/@wzrddev/opencode-remi)

**Remi**: The WZRD.dev agent with auto-mode detection for OpenCode.

Transform your OpenCode experience with Remi, an AI assistant that automatically detects task types and switches between 5 specialized modes:

- **CHAT MODE**: Casual conversation, simple questions
- **CODER MODE**: Code generation, implementation
- **THINKER MODE**: Architecture, planning, design
- **DEBUG MODE**: Error fixing, problem solving
- **RESEARCH MODE**: Deep investigation, comprehensive analysis

## 🚀 Quick Start

### One-Line Installation

```bash
npx @wzrddev/opencode-remi@latest
```

### Manual Installation

```bash
npm install @wzrddev/opencode-remi
```

### Script Installation

```bash
curl -s https://raw.githubusercontent.com/wzrddev/opencodewzrd/main/install.sh | bash
```

## 📦 Features

### Auto-Mode Detection
Remi automatically detects which mode to use based on your input:

| Trigger | Mode |
|---------|------|
| "Hi", casual talk | CHAT |
| "Write code", "function" | CODER |
| "Design", "plan", "architecture" | THINKER |
| "Error", "bug", "broken" | DEBUG |
| "Research", "compare", "analyze" | RESEARCH |

### 180+ Built-in Skills
Access specialized skills for every task:
- **Coding**: All languages and frameworks
- **Debugging**: Error analysis and fixes
- **Architecture**: System design and planning
- **Research**: Comprehensive investigation
- **Automation**: Task scheduling and workflows
- **Security**: Auditing and best practices

### OpenCode Integration
- Seamless integration with OpenCode editor
- Context-aware responses
- Workspace integration
- File operations support

## 🎯 Usage

### CLI Commands

```bash
# Start interactive session
wzrd chat "Write a Python function to calculate Fibonacci"

# List available modes
wzrd modes

# Show loaded skills
wzrd skills

# Setup configuration
wzrd setup
```

### OpenCode Integration

Once installed, Remi integrates directly with OpenCode:

1. Open any project in OpenCode
2. Use the command palette: `Cmd/Ctrl + Shift + P`
3. Type "Remi" to access WZRD.dev commands
4. Ask questions directly in the editor

### Examples

```bash
# CODER MODE example
$ wzrd chat "Write a React component that displays a counter"
[CODER MODE]
I'll help you write code...

# THINKER MODE example  
$ wzrd chat "Design a database schema for an e-commerce site"
[THINKER MODE]
I'll help you design and plan...

# DEBUG MODE example
$ wzrd chat "I'm getting 'undefined is not a function' error"
[DEBUG MODE]
I'll help you debug...
```

## 🔧 Configuration

### Setup Configuration

```bash
wzrd setup
```

This creates `~/.wzrd/config.json` with:

```json
{
  "autoModeDetection": true,
  "skillDirectory": "./skills",
  "logLevel": "info",
  "maxResponseLength": 5000,
  "enableSkills": true
}
```

### Custom Skills

Add custom skills to `~/.wzrd/skills/`:

```json
{
  "name": "my-custom-skill",
  "description": "My custom skill",
  "modes": ["CODER", "THINKER"],
  "instructions": "Help with my specific tasks",
  "examples": ["Do my thing", "Help with that"],
  "tags": ["custom", "special"],
  "version": "1.0.0"
}
```

## 📁 Project Structure

```
opencodewzrd/
├── src/
│   ├── index.ts          # Main entry point
│   ├── agent.ts          # Core agent with mode detection
│   ├── cli.ts            # Command line interface
│   └── types.ts          # Type definitions
├── skills/               # Bundled skills
├── dist/                 # Compiled output
├── scripts/
│   └── bundle-skills.js  # Skill bundling script
├── test/                 # Test files
├── package.json          # NPM package config
├── tsconfig.json        # TypeScript config
└── README.md            # This file
```

## 🛠️ Development

### Prerequisites

- Node.js 16+
- OpenCode 1.0+
- TypeScript 5.0+

### Build from Source

```bash
# Clone repository
git clone https://github.com/wzrddev/opencodewzrd.git
cd opencodewzrd

# Install dependencies
npm install

# Build package
npm run build

# Test locally
npm test
```

### Adding New Skills

1. Create skill file in `example-skills/`
2. Run `npm run build:skills` to bundle
3. Skills will be included in distribution

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Skill Contributions
- Add new skill JSON files
- Improve existing skills
- Update documentation
- Report issues

## 📄 License

MIT © [WZRD.dev](https://wzrd.dev)

## 🔗 Links

- [GitHub Repository](https://github.com/wzrddev/opencodewzrd)
- [NPM Package](https://npmjs.com/package/@wzrddev/opencode-remi)
- [OpenCode Marketplace](https://opencode.dev/marketplace)
- [WZRD.dev Website](https://wzrd.dev)

## 🆘 Support

Having issues? Check:

1. **OpenCode Compatibility**: Ensure OpenCode >= 1.0.0
2. **Node.js Version**: Requires Node.js >= 16.0.0
3. **Permissions**: Check OpenCode extension permissions
4. **Network**: Skills require internet for initial download

Create an [issue on GitHub](https://github.com/wzrddev/opencodewzrd/issues) for bugs or feature requests.

---

**"Good architecture is invisible. Bad architecture is impossible to ignore."** - Remi, WZRD.dev Agent