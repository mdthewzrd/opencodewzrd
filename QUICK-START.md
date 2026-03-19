# WZRD.dev OpenCode Extension - Quick Start

## 🚀 One Minute Setup

```bash
# Install with one command
curl -s https://raw.githubusercontent.com/mdthewzrd/opencodewzrd/main/install.sh | bash
```

## 📋 What You Get

### Core Features
- **Auto-mode detection** - Remi automatically switches between 5 modes
- **180+ skills** - Pre-loaded for instant use
- **CLI interface** - `wzrd` command available everywhere
- **OpenCode integration** - Works within your editor

### Five Modes
1. **CHAT** - Casual conversation
2. **CODER** - Code generation  
3. **THINKER** - Architecture & planning
4. **DEBUG** - Error fixing
5. **RESEARCH** - Deep analysis

## 🎯 First Use

### 1. Setup Configuration
```bash
wzrd setup
```

### 2. Test It Out
```bash
# Try CODER mode
wzrd chat "Write a Python function to calculate factorial"

# Try THINKER mode
wzrd chat "Design a database schema for a blog"

# Try DEBUG mode
wzrd chat "I'm getting 'undefined is not a function' error"

# See all modes
wzrd modes
```

### 3. OpenCode Integration
1. Open any project in OpenCode
2. Use command palette: `Cmd/Ctrl + Shift + P`
3. Type "Remi" to see available commands
4. Select "Chat with Remi" to start

## 🔧 Common Tasks

### Writing Code (CODER MODE)
```bash
wzrd chat "Create a React component with useState"
wzrd chat "Write SQL query to find top 10 users"
wzrd chat "Implement authentication in Express.js"
```

### System Design (THINKER MODE)
```bash
wzrd chat "Design microservices architecture"
wzrd chat "Plan API endpoints for social app"
wzrd chat "Database schema for e-commerce"
```

### Debugging (DEBUG MODE)
```bash
wzrd chat "Fix 'Cannot read property of undefined'"
wzrd chat "Why is my API returning 500 error?"
wzrd chat "Memory leak in Node.js app"
```

### Research (RESEARCH MODE)
```bash
wzrd chat "Compare React vs Vue for 2025"
wzrd chat "Best practices for REST API design"
wzrd chat "Latest AI development trends"
```

## ⚙️ Configuration

### View Current Config
```bash
cat ~/.wzrd/config.json
```

### Custom Config
Edit `~/.wzrd/config.json`:
```json
{
  "autoModeDetection": true,
  "skillDirectory": "./skills",
  "logLevel": "info",
  "maxResponseLength": 5000,
  "enableSkills": true
}
```

### Add Custom Skills
```bash
# Create custom skill
mkdir -p ~/.wzrd/skills
cat > ~/.wzrd/skills/my-skill.json << 'EOF'
{
  "name": "my-skill",
  "description": "My custom skill",
  "modes": ["CODER", "THINKER"],
  "instructions": "Help with my specific tasks",
  "examples": ["Do my thing", "Help with that"],
  "tags": ["custom"],
  "version": "1.0.0"
}
EOF
```

## 🐛 Troubleshooting

### Installation Issues
```bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Verify installation
which wzrd || echo "Not in PATH, use: npx wzrd modes"
```

### Permission Issues
```bash
# Make install script executable
chmod +x install.sh

# Check OpenCode permissions
# Open OpenCode → Settings → Extensions → Permissions
```

### Network Issues
```bash
# Check if skills loaded
wzrd skills

# Should show: "Loaded Skills: 5" (or more)
```

## 📚 Next Steps

1. **Explore all modes**: `wzrd modes`
2. **See loaded skills**: `wzrd skills`
3. **Read full docs**: [README.md](README.md)
4. **Join community**: [GitHub Issues](https://github.com/mdthewzrd/opencodewzrd/issues)

## 🆘 Need Help?

```bash
# Show help
wzrd --help

# Check version
wzrd --version

# Create issue on GitHub
open https://github.com/mdthewzrd/opencodewzrd/issues/new
```

---

**Pro Tip**: Remi works best when you're specific. Instead of "help with code", try "write a Python function that sorts a list".

Happy coding with Remi from WZRD.dev! 🚀