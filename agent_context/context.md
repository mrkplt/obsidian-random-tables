# Random Table Plugin

## Overview (User Perspective)

The **Random Table** plugin allows you to pull random entries from custom markdown tables and insert them directly into your note.

### How to Use:

1. Create a folder called `RandomTables` in your Obsidian vault.
2. Add markdown files with the following structure:

```
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
5. Select the command — the plugin will **insert a random item** (like "Sword") at the **current cursor location** in your active note.

To **reload** all tables (e.g., after editing or adding files), use:  
`Random Table > Reload Tables`

---

## Developer Notes

### Functionality

- Files must reside in a folder called `RandomTables/`.
- Markdown files should contain lists divided by `---`.
- Each list begins with a title line and is followed by bullet-point entries.
- The plugin scans these files at startup and registers palette commands like:
  `Random Table > FileName > ListTitle`

### Code Highlights

- `main.ts` registers a command per table, using `editorCallback` to insert the selection.
- Selections are chosen randomly with `Math.floor(Math.random() * items.length)` and inserted at `editor.getCursor()` via `editor.replaceRange()`.

### Parsing Logic

- Implemented in `src/table-utils.ts`.
- Uses regex to extract:
  - Each section's title
  - List of items under each title
- Ignores sections without a proper list.

### Testing

- **Test Framework**: [Jest](https://jestjs.io/)
- **Unit Tests**: Found in `__tests__/*`
  - `table-utils.test.ts` validates parsing logic
  - `plugin.test.ts` validates command registration and behavior
- **Mocking**: Handled via `mocks/obsidian.ts`
  - Includes typed mock `Vault`, `Editor`, `Plugin` interfaces
  - Simulates the Obsidian environment without real file I/O

Run tests with:
```bash
npm install
npm test
```

---

## Resources

- Obsidian Plugin API:  
  https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts

- Plugin Publishing Guidelines:  
  https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

- Sample Plugin Repo:  
  https://github.com/obsidianmd/obsidian-sample-plugin

- Jest Documentation:  
  https://jestjs.io/

- `memfs` Virtual Filesystem:  
  https://github.com/streamich/memfs
