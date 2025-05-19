# Random Tables for Obsidian

An Obsidian plugin that transforms markdown lists into random generators, the way a table works in a ttrpg. When you choose the list from the command pallete a random entry from the it is inserted at the cursor position. Updating a list will cause it to be reloaded. Adding a new list will cause a new command to be registered.

![Plugin Overview](https://github.com/mrkplt/obsidian-random-tables/blob/master/docs/images/overview.png?raw=true)

## 🚀 Quick Start

To get started, create markdown files in your `RandomTables` directory with your desired lists. The plugin will automatically detect and register commands for each list.

- **Basic Setup**:
  1. Create a `RandomTables` folder in your vault
  2. Add markdown files with your lists (see format examples below)
  3. Access commands via the command palette (`Cmd/Ctrl + P`)

- **Example List File**:
  ```markdown
  # Weapons 
  - Sword
  - Axe
  - Bow
  
  ---
  
  # Armor
  - Chainmail
  - Plate
  - Leather
  ```

## ⚙️ Configuration

Customize the plugin behavior through Obsidian's settings panel:

- **Folder Location**: Specify custom directory for lists
- **Insert Behavior**:
  - None: Insert only the selected item
  - Space: Add a space after the item
  - New Line: Add a new line after the item


![Plugin Settings](https://github.com/mrkplt/obsidian-random-tables/blob/master/docs/images/settings.png?raw=true)

## ✨ Feature Overview
- **Table Formats**:
  - Simple bullet/numbered lists with automatic naming
  - Sectioned tables with custom headers
  - Multiple tables per file using `---` separators
  - Support for both ordered and unordered lists

- **Runtime Features**:
  - Real-time file system change listeners
  - Dynamic command registration/unregistration
  - Configurable after text insertion behavior (none/space/newline)
  - Configurable source folder location

## 📚 List Format Reference

The plugin supports flexible table formats to accommodate different use cases while maintaining simplicity. Headings are optional but strongly recommended. Headers can be any string, except for markdown list markers (`-`, `*`, `+`, or `1. `)

- **Simple List**:
  ```markdown
  - Item 1
  - Item 2
  - Item 3
  ```

- **Named Lists**:
  ```markdown
  # Table Name
  - Item 1
  - Item 2
  - Item 3
  ```

- **Multiple Lists In One File**:
  ```markdown
  # First List Name
  - Item 1
  - Item 2
  - Item 3
  ---
  # Second List Name
  - Item 1
  - Item 2
  - Item 3
  ```

## 🛠 Development

```bash
# Install dependencies
npm install

# Build the plugin - creates package in dist and copies directory contents to local plugin directory on my system.
npm run build

# Run tests - test coverage is dodgey
npm test
```

## 🔍 Troubleshooting

For development reloads, use these commands in the Obsidian console:
```javascript
app.plugins.disablePlugin("random-tables")
app.plugins.enablePlugin("random-tables")
```

## 🚨 Important Note

This plugin was developed using Windsurf with extensive LLM assistance. The code has NOT been carefully reviewed, but has been manually tested. Don't expect beauty.