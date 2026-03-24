# OpenCode Extension Setup Guide

This guide explains how to set up the WZRD.dev OpenCode extension, which adds a custom `wzrd-dev` command to the OpenCode CLI.

## What Is This?

The OpenCode extension allows you to launch the WZRD.dev TUI directly from the OpenCode CLI using:

```bash
opencode wzrd-dev
```

## Prerequisites

- OpenCode CLI installed (`npm install -g opencode` or `bun install -g opencode`)
- WZRD.dev TUI binary built (see [WZRD.dev TUI README](../opencode-tui/README.md))

## Installation

### Step 1: Install OpenCode CLI

```bash
# Via npm
npm install -g opencode

# Or via bun
bun install -g opencode

# Verify installation
opencode --version  # Should show 1.3.0 or higher
```

### Step 2: Create OpenCode Configuration Directory

```bash
mkdir -p ~/.opencode/bin
mkdir -p ~/.opencode/agents
```

### Step 3: Set Up the wzrd-dev Command

Create the command file at `~/.opencode/bin/wzrd.dev`:

```bash
cat > ~/.opencode/bin/wzrd.dev << 'EOF'
#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const wzrdDir = process.env.WZRD_HOME || path.join(require('os').homedir(), 'wzrd-redesign');
const tuiBinary = path.join(wzrdDir, 'bin', 'wzrd-dev-optimized');

console.log('\n\x1b[1m\x1b[35m╔══════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[1m\x1b[35m║ WZRD.dev - Launching TUI                                 ║\x1b[0m');
console.log('\x1b[1m\x1b[35m╚══════════════════════════════════════════════════════════╝\x1b[0m\n');

const tui = spawn('node', [tuiBinary, '--mode', 'chat'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    WZRD_AGENT: 'remi',
    WZRD_MODE: 'tui',
    FORCE_COLOR: '1',
  },
});

tui.on('error', (err) => {
  console.error('\x1b[31m❌ Failed to launch TUI:\x1b[0m', err.message);
  process.exit(1);
});

tui.on('exit', (code) => {
  process.exit(code || 0);
});
EOF

chmod +x ~/.opencode/bin/wzrd.dev
```

### Step 4: Set Default Agent

Create `~/.opencode/default-agent.json`:

```json
{
  "agent": "remi",
  "autoLoad": true
}
```

### Step 5: Copy Agent Configurations

Copy the agent JSON files from this repository to `~/.opencode/agents/`:

```bash
# From the wzrdclaw repository
cp agents/remi.json ~/.opencode/agents/
cp agents/remi-coder.json ~/.opencode/agents/
cp agents/remi-debug.json ~/.opencode/agents/
cp agents/remi-architect.json ~/.opencode/agents/
```

**Note:** These agent files contain the Remi persona and tool configurations. They are required for the extension to work properly.

### Step 6: Verify Installation

```bash
# Check OpenCode version
opencode --version

# Show wzrd-dev help
opencode wzrd-dev --help

# Launch the TUI
opencode wzrd-dev
```

## Available Commands

Once installed, you can use:

| Command | Description |
|---------|-------------|
| `opencode wzrd-dev` | Launch the WZRD.dev TUI |
| `opencode wzrd-dev --help` | Show help |
| `opencode agent list` | List available agents |
| `opencode agent show remi` | Show Remi agent details |

## Troubleshooting

### Command Not Found

If `opencode wzrd-dev` returns "command not found":

1. Verify the file exists: `ls -la ~/.opencode/bin/wzrd.dev`
2. Check it's executable: `chmod +x ~/.opencode/bin/wzrd.dev`
3. Restart your terminal or run `hash -r`

### TUI Binary Not Found

If you get "Failed to launch TUI" error:

1. Set the `WZRD_HOME` environment variable to your WZRD.dev installation directory
2. Or ensure the TUI binary exists at `~/wzrd-redesign/bin/wzrd-dev-optimized`

### Agent Not Loading

If the Remi agent doesn't load:

1. Check `~/.opencode/agents/remi.json` exists
2. Verify the JSON is valid: `cat ~/.opencode/agents/remi.json | jq .`
3. Check OpenCode logs: `~/.local/share/opencode/log/`

## File Structure

```
~/.opencode/
├── bin/
│   └── wzrd.dev              # The wzrd-dev command
├── agents/
│   ├── remi.json             # Main Remi agent
│   ├── remi-coder.json       # Coder mode agent
│   ├── remi-debug.json       # Debug mode agent
│   └── remi-architect.json   # Architect mode agent
└── default-agent.json        # Default agent configuration
```

## Updating

To update the extension:

1. Pull the latest agent configs from the repository
2. Copy them to `~/.opencode/agents/`
3. Restart any running OpenCode sessions

## Uninstallation

To remove the extension:

```bash
rm ~/.opencode/bin/wzrd.dev
rm ~/.opencode/agents/remi*.json
rm ~/.opencode/default-agent.json
```

## See Also

- [WZRD.dev TUI README](../opencode-tui/README.md) - TUI implementation details
- [NanoClaw README](../README.md) - Main project documentation
- [OpenCode Documentation](https://docs.opencode.ai) - Official OpenCode docs
