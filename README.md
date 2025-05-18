# Random Tables for Obsidian

A powerful Obsidian plugin that turns your markdown lists into random table generators. Perfect for RPG sessions, random prompts, or any use case where you need quick random selections from custom tables.

## ✨ Features

- **Multiple Table Formats**
  - Simple bullet/numbered lists
  - Sectioned tables with headers
  - Multiple tables per file using `---` separators

- **Automatic Updates**
  - Real-time file watching
  - Automatic command regeneration on changes
  - Efficient reloading without memory leaks

- **User-Friendly**
  - Intuitive command palette integration
  - Clear command naming
  - Automatic table detection
  - Configurable separators after insert (space, newline, or none)

## ⚠️ Note on Current Development
This plugin is currently in active development. The settings functionality is partially implemented but not yet fully functional. You can still use all core features, but some settings may not work as expected.

## 🚀 Quick Start

1. **Create Tables**
   - Create a folder named `RandomTables` in your vault
   - Add markdown files with your tables:

   ```markdown
   # Simple List (Auto-named)
   - Sword
   - Axe
   - Bow
   
   ---
   
   # Named Table
   Weapons
   - Dagger
   - Mace
   - Staff
   
   ---
   
   # Numbered Lists Work Too
   1. Potion of Healing
   2. Potion of Strength
   3. Potion of Invisibility
   ```

2. **Use Commands**
   - Open command palette (`Cmd/Ctrl + P`)
   - Search for `Random Tables: Insert [FileName] > [TableName]`
   - Select to insert a random item at cursor

3. **That's it!** Tables update automatically when you save changes.

## 📂 Table Format Reference

### Simple List
```markdown
- Item 1
- Item 2
- Item 3
```

### Named Table
```markdown
# Table Name
- Item 1
- Item 2
- Item 3
```

### Multiple Tables in One File
```markdown
# Weapons
- Sword
- Axe
---
# Armor
- Chainmail
- Plate
---
# Potions
- Healing
- Mana
```

## 🛠 Development

### Prerequisites
- Node.js (LTS)
- Obsidian (latest)
- Enable Developer Mode in Obsidian Settings > Advanced

### Setup
```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test
```

### Project Structure
```
random_table/
├── agent_context/     # Project documentation
├── __tests__/         # Test files
│   └── __fixtures__/  # Test data
├── src/               # Source code
│   ├── main.ts        # Plugin entry point
│   ├── table-loader.ts # Table management
│   ├── command-loader.ts # Command handling
│   └── table-utils.ts  # Table parsing utilities
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

```
app.plugins.disablePlugin["random-tables"]
app.plugins.enablePlugin["random-tables"]
```
