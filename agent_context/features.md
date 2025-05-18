# Features

## Current Features
- **Settings System** (Partially Implemented):
  - **Folder Selection**:
    - Customizable folder location for table files (default: 'RandomTables')
    - Real-time folder validation and feedback
    - Automatic reload when folder location changes
  - **Insert Behavior**:
    - Dropdown to select separator after insert (none/space/newline)
    - Changes apply to new commands immediately
    - Supports three separator options:
      - None: Inserts only the random item
      - Space: Adds a space after the item
      - New Line: Adds a new line after the item
  - **Performance**:
    - Debounced file system operations (750ms)
    - Efficient updates to prevent UI blocking
  - **Persistence**:
    - Settings saved between Obsidian sessions
    - Automatic migration of existing settings

## Core Features
- **Table Storage**:
  - Uses both array and dictionary storage for optimal performance
  - Automatic deduplication of tables based on filename and title
  - Efficient updates when files change
  - Support for table lookup by composite key (filename:title)

- **Table Parsing**:
  - Supports multiple tables per file using `---` separators
  - Handles both bulleted (-, *) and numbered (1., 2.) lists
  - Supports "naked" lists (lists without section headers)
  - Automatically trims whitespace from items

- **Command System**:
  - Dynamic command registration based on table structure
  - Commands follow pattern: "Random Tables: Insert [FileName] > [TableName]"
  - Special handling for naked lists: "Random Tables: Insert [FileName]"

- **File Watching**:
  - Automatic reload when files in RandomTables/ change
  - Handles file creation, modification, and deletion
  - Efficient reloading without memory leaks

- **Testing**:
  - Comprehensive test coverage for table parsing
  - Fixture-based testing with real markdown files
  - Tests for edge cases (empty content, whitespace, etc.)

## User Experience
- Settings can be configured through the Obsidian settings panel
- Changes to settings take effect immediately for new commands
- Settings are persisted between Obsidian restarts

## Technical Implementation
- **Settings Management**:
  - Uses Obsidian's settings API for persistence
  - Type-safe settings interface with defaults
  - Automatic settings migration when structure changes
- **Performance Optimizations**:
  - 750ms debounce on folder input to prevent excessive reloads
  - Efficient file watching with proper cleanup
  - Lazy loading of settings where possible
- **UI/UX**:
  - Dropdown for separator selection
  - Folder input with auto-complete
  - Immediate visual feedback for settings changes

## Known Limitations
- **Folder Selection**:
  - Changing folders doesn't automatically move existing files
  - No recursive folder scanning (flat structure only)
- **Performance**:
  - Large numbers of tables may cause slight UI delays
  - Debounce delay (750ms) is fixed
- **UI/UX**:
  - Settings UI is functional but may be refined
  - Limited validation for folder names
  - No visual indicator during folder scanning
- Users create markdown files in the RandomTables/ directory
- Each file can contain multiple tables separated by `---`
- Tables can have optional headers or be simple lists
- Commands are automatically generated and updated
- Selections are inserted at cursor position in active editor
- Changes to table files are automatically detected and commands are updated