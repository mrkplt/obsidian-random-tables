# Features

## Current Features
- **Settings System** (Partially Implemented):
  - Configurable separators after insert (space, newline, or none)
  - Settings tab in Obsidian preferences
  - Settings persistence between sessions

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
- Settings are managed through Obsidian's settings API
- CommandLoader uses a getter function to always access current settings
- Settings changes don't require plugin restart

## Known Limitations
- Settings UI is functional but may change in future versions
- Some settings may not be fully implemented yet
- Users create markdown files in the RandomTables/ directory
- Each file can contain multiple tables separated by `---`
- Tables can have optional headers or be simple lists
- Commands are automatically generated and updated
- Selections are inserted at cursor position in active editor
- Changes to table files are automatically detected and commands are updated