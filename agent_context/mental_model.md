# Project Mental Model

## Architecture Overview
- TypeScript-based Obsidian plugin
- Main components:
  - src/main.ts: Plugin entry point and command registration
  - src/table-utils.ts: Table parsing logic
  - __tests__/table-utils.test.ts: Test suite
  - mocks/obsidian.ts: Mock Obsidian API for testing

## Key Features
- Random table selection from markdown files
- Command-based interface
- Table parsing with section markers
- Support for multiple tables in a single file
- Dynamic command generation from table structure

## Technical Details
- Uses TypeScript with Jest for testing
- Follows Obsidian plugin architecture
- Uses ES modules with TypeScript
- Implements regex-based table parsing
- Uses Obsidian's editor API for text insertion