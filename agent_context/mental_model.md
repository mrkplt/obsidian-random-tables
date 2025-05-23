# Project Mental Model

## Architecture Overview
- TypeScript-based Obsidian plugin
- Main components:
  - src/main.ts: Plugin entry point and lifecycle management
  - src/table-loader.ts: Handles loading and managing tables from markdown files
  - src/command-loader.ts: Manages dynamic command registration and text insertion
  - src/table-utils.ts: Table parsing and utility functions
  - __tests__/: Test files with Jest
  - __fixtures__/RandomTables/: Test data

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
  - Tables are stored in both an array (`tables`) and a dictionary (`tablesMap`)
  - The dictionary uses a composite key format: `${fileName}:${tableTitle}` (lowercase)
  - Only the array is exposed via `getTables()`
  - The dictionary is used internally to maintain uniqueness and rebuild the array

- **Planned Enhancement**:
  - Expose dictionary functionality through the public API
  - Add methods for direct table lookup by key
  - Improve table update/delete performance using the dictionary

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