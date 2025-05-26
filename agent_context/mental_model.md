# Project Mental Model

## Architecture Overview
- TypeScript-based Obsidian plugin
- Main components:
  - src/main.ts: Plugin entry point, lifecycle management, and event wiring
    - Uses `app.workspace.onLayoutReady` to ensure vault/files are ready before loading tables and setting up file watchers
  - src/table-loader.ts: Handles loading and managing tables from markdown files
  - src/command-loader.ts: Manages dynamic command registration and text insertion
    - Command IDs now use a simplified format: `${fileNameKey}-${titleKey}` (no prefix)
    - Commands close over their table data at registration; persistent table state is not needed
  - src/table-utils.ts: Table parsing and utility functions
  - __tests__/: Test files with Jest
  - __fixtures__/RandomTables/: Test data

## Logging Conventions
- Debug and error logging is now conditional on the plugin's 'Debug' setting (settings.ts)
- When debug mode is enabled, `console.debug` and some `console.error` logs are active; when disabled, only essential errors are logged
- Logging modernization: uses standard `console.debug`, `console.error`, etc. instead of custom prefixes
- Error handling is robust and logs failures without interrupting plugin operation


## Settings Flow
1. User updates settings in the Obsidian settings panel
2. Settings are persisted via Obsidian's settings API
3. On change, the plugin updates its internal state
4. CommandLoader is reinitialized with new settings
5. New commands use the updated settings for text insertion

## Last Character Feature
- **Implementation**:
  - Handled in CommandLoader's command callbacks
  - Applies the selected separator after inserting random text
  - Supports three modes: none, space, and newline
- **User Experience**:
  - Changes take effect immediately for new commands
  - No restart required
  - Visual feedback in settings UI

## Data Storage
- **Current Implementation**:
  - Tables are loaded as needed and passed to CommandLoader for command registration
  - There is no persistent table state outside the reload/registration process
  - Each command's callback closes over its table data at the time of registration
  - Each table contains a `sourceFile` property tracking the file it originated from
  - Tables are exposed via the `getTables()` method which returns a copy of the array

- **File-Specific Loading**:
  - The system can now load tables from a specific file using `loadTables(file: TFile)`
  - When a specific file is provided, only tables from that file are processed
  - When no file is specified, all tables from the configured folder are loaded

## Key Features
- Random table selection from markdown files in RandomTables/ directory
- Supports multiple tables per file using `---` separators
- Dynamic command generation based on table structure
- Automatic reloading of tables on file changes
- Support for both bulleted and numbered lists
- Special handling for "naked" lists (lists without headers)

## Technical Details
- Uses TypeScript with strict type checking
- Follows Obsidian plugin architecture
- Implements file watching for automatic reloads
- Uses Jest for testing with fixture-based testing
- Handles both bulleted (-, *) and numbered (1., 2.) lists
- Supports table sections with or without headers