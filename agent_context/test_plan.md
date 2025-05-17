# Random Table Plugin - Test Plan

## 1. Test Environment Setup

### 1.1 Directory Structure
```
src/__tests__/
├── mocks/
│   └── obsidian.ts
├── __fixtures__/
│   └── RandomTables/
│       ├── equipment.md
│       └── equipment-multiple.md
├── plugin.test.ts
├── table-loader.test.ts
└── command-loader.test.ts
```

### 1.2 Dependencies
- Jest
- TypeScript
- ts-jest
- @types/jest

## 2. Test Cases

### 2.1 Plugin Initialization (plugin.test.ts)

#### 2.1.1 Plugin Setup
- [ ] Test plugin instantiation with valid manifest
- [ ] Test plugin initialization lifecycle
- [ ] Test plugin cleanup on unload

#### 2.1.2 Event Listeners
- [ ] Verify 'modify' event listener registration
- [ ] Verify 'create' event listener registration
- [ ] Verify 'delete' event listener registration
- [ ] Test event listener cleanup on unload

### 2.2 Table Loading (table-loader.test.ts)

#### 2.2.1 Basic Loading
- [ ] Load tables from single file
- [ ] Load tables from multiple files
- [ ] Handle empty files
- [ ] Handle malformed files
- [ ] Handle file read errors

#### 2.2.2 File System Events
- [ ] Tables reload on file modification
- [ ] Tables update on file creation
- [ ] Tables update on file deletion
- [ ] Handle concurrent file operations

### 2.3 Command Loading (command-loader.test.ts)

#### 2.3.1 Command Registration
- [ ] Commands are registered on load
- [ ] Commands have proper metadata
- [ ] Commands are unregistered on unload

#### 2.3.2 Command Execution
- [ ] Command callbacks execute with correct context
- [ ] Editor commands receive editor instance
- [ ] Commands handle errors gracefully

## 3. Test Data

### 3.1 Fixture Files
- `equipment.md`: Single table definition
- `equipment-multiple.md`: Multiple table definitions
- `malformed.md`: Intentionally invalid table definitions
- `empty.md`: Empty file

## 4. Mock Implementation Details

### 4.1 Obsidian Mocks (obsidian.ts)
- [ ] Add `onload`/`onunload` tracking
- [ ] Enhance Vault mock for file events
- [ ] Add command execution tracking
- [ ] Implement file system simulation

## 5. Test Execution Plan

### 5.1 Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- table-loader.test.ts
```

### 5.2 Coverage Report
```bash
npm test -- --coverage
```

## 6. Test Coverage Goals

| File                | % Stmts | % Branch | % Funcs | % Lines |
|---------------------|---------|----------|---------|---------|
| src/               | 100     | 100      | 100     | 100     |
|  main.ts           | 100     | 100      | 100     | 100     |
|  table-loader.ts   | 100     | 100      | 100     | 100     |
|  command-loader.ts | 100     | 100      | 100     | 100     |


## 7. Implementation Notes

### 7.1 Test Isolation
- Each test should be independent
- Reset mocks between tests
- Clean up after each test

### 7.2 Test Data Management
- Use factory functions for test data
- Keep test data close to tests
- Document test data structure

## 8. Future Enhancements

### 8.1 Integration Tests
- Test with real Obsidian instance
- Test plugin in different Obsidian versions
- Test with large table files

### 8.2 Performance Testing
- Measure load time with large tables
- Profile memory usage
- Test with many concurrent operations

## 9. Sign-off

- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance benchmarks met

## 10. Changelog

### 2025-05-17
- Initial test plan created
- Outlined test cases and structure
- Defined test coverage goals

## 11. Dependencies

- Node.js >= 16.0.0
- npm >= 8.0.0
- TypeScript >= 4.5.0
- Jest >= 27.0.0
- ts-jest >= 27.0.0
