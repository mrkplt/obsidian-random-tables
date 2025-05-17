# Random Table Plugin for Obsidian

A plugin that allows you to pull random entries from custom markdown tables and insert them directly into your notes.

## Features

- Random table selection from markdown files
- Command-based interface for table selection
- Table parsing with section markers
- Support for multiple tables in a single file using --- markers
- Dynamic command registration based on table structure
- Test coverage for table parsing functionality

## Usage

1. Create a folder called `RandomTables` in your Obsidian vault.
2. Add markdown files with the following structure:

```markdown
Weapons
- Sword
- Axe
---
Potions
- Healing
- Mana
```

3. Open the command palette (Cmd/Ctrl + P).
4. Search for commands like `Random Table > TestTable > Weapons`.
5. Select the command — the plugin will insert a random item (like "Sword") at the current cursor location in your active note.

To reload all tables (e.g., after editing or adding files), use:
`Random Table > Reload Tables`

## Development Setup

### Prerequisites

1. Install Node.js (LTS version recommended)
2. Install Obsidian Desktop (latest version)
3. Enable Developer Mode in Obsidian:
   - Open Obsidian Settings
   - Navigate to "Advanced" section
   - Enable "Developer Mode"

### Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Create a symlink to your Obsidian vault's plugins directory:
   ```bash
   # For macOS/Linux:
   ln -s /path/to/random_table/dist /path/to/your/vault/.obsidian/plugins/random-table
   
   # For Windows:
   mklink /D "C:\Users\YourName\AppData\Roaming\Obsidian\.obsidian\plugins\random-table" "/path/to/random_table/dist"
   ```

### Testing

1. Run tests:
   ```bash
   npm test
   ```
2. Test in Obsidian:
   - Open Obsidian
   - Enable Developer Mode if not already enabled
   - The plugin should automatically load from the symlink
   - Test functionality using the command palette

### Debugging

1. Enable Developer Tools in Obsidian:
   - Open Obsidian Settings
   - Navigate to "Developer" section
   - Click "Open Developer Tools"
2. Use console.log statements in your code for debugging
3. The plugin's code runs in the Obsidian main process, so check the "Main" tab in Developer Tools

## Project Structure

```
random_table/
├── agent_context/
│   ├── session_summary.md
│   ├── mental_model.md
│   ├── features.md
│   └── bugs.md
├── __tests__/
│   └── table-utils.test.ts
├── mocks/
│   └── obsidian.ts
├── src/
│   ├── main.ts
│   └── table-utils.ts
├── package.json
└── jest.config.js
```

## Development

### Setup

```bash
npm install
npm test
```

### Technical Details

- Uses TypeScript with Jest for testing
- Follows Obsidian plugin architecture
- Uses ES modules with TypeScript
- Implements regex-based table parsing
- Uses Obsidian's editor API for text insertion

### Code Highlights

- `main.ts` registers a command per table, using `editorCallback` to insert the selection.
- Selections are chosen randomly with `Math.floor(Math.random() * items.length)` and inserted at `editor.getCursor()` via `editor.replaceRange()`.

### Testing

- **Test Framework**: [Jest](https://jestjs.io/)
- **Unit Tests**: Found in `__tests__/*`
  - `table-utils.test.ts` validates parsing logic
  - `plugin.test.ts` validates command registration and behavior
- **Mocking**: Handled via `mocks/obsidian.ts`
  - Includes typed mock `Vault`, `Editor`, `Plugin` interfaces
  - Simulates the Obsidian environment without real file I/O

## Resources

- Obsidian Plugin API:  https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts
- Plugin Publishing Guidelines:  https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Sample Plugin Repo:  https://github.com/obsidianmd/obsidian-sample-plugin
- Jest Documentation:  https://jestjs.io/
- `memfs` Virtual Filesystem:  https://github.com/streamich/memfs


```
1. List All Enabled Plugins

console.log(app.plugins.enabledPlugins);

This logs a Set of plugin IDs that are currently enabled.
2. Check if a Specific Plugin Is Enabled

app.plugins.enabledPlugins.has("PLUGIN-ID")

Replace PLUGIN-ID with the plugin's id from its manifest.json. For example, if your plugin's manifest.json has:

{
  "id": "random-table",
  "name": "Random Table"
}

Then:

app.plugins.enabledPlugins.has("random-table")

Returns true if enabled.
3. Get the Plugin Instance

If the plugin is enabled and you want to access its instance (e.g., to call methods or inspect state):

const plugin = app.plugins.plugins["random-table"];
console.log(plugin);

4. Reload the Plugin from Console

To disable and re-enable a plugin programmatically:

await app.plugins.disablePlugin("random-table");
await app.plugins.enablePlugin("random-table");

Useful for hot-reloading during development.
`