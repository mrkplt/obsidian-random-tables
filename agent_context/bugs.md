# Bug Reports

## Recently Resolved

### FEAT-001: Last Character Separator (2025-05-18)
- **Status**: Resolved
- **Priority**: High
- **Description**: Implemented the ability to add a separator (none/space/newline) after inserted random text
- **Changes Made**:
  - Updated CommandLoader to accept and use settings
  - Added separator insertion logic in command callbacks
  - Ensured proper settings propagation on reload
- **Verification**:
  - Tested all three separator options
  - Verified settings persistence
  - Confirmed immediate application of changes

## Open Issues

### ENH-001: Expose Dictionary Functionality (2025-05-17)
- **Status**: Open
- **Priority**: Medium
- **Description**: The TableLoader currently uses a dictionary internally but doesn't expose this functionality through its public API
- **Planned Changes**:
  - Add `getTable(key: string): Table | undefined` method
  - Add `getTableKeys(): string[]` method
  - Update documentation to reflect the new API
  - Add tests for dictionary functionality

### BUG-001: Missing Context Files (2025-05-16)

#### Context
- **Session Reference**: Initial Project Setup
- **Files**: None
- **Function/Component**: Project Initialization
- **Related Features**: None
- **User-Observed Behavior**: Project setup was performed without proper context files
- **Expected Behavior**: Project setup should only occur after all required context files are created and reviewed

#### Technical Analysis
```typescript
// No code was written during this phase
```

#### Related Bugs
- **Dependencies**: None
- **Affected By**: None
- **Will Affect**: All future development work until fixed

#### Reproduction Pattern
1. Attempt to start project development without first creating required context files
2. Proceed with development work
3. Violate critical workflow protocol

#### Verification Steps
1. Confirm that all required context files are created before any development work begins
2. Verify that files are properly formatted according to templates
3. Ensure all context files are reviewed and approved before proceeding

#### Conjectured Solution
1. Create required context files using templates
2. Review and approve all context files
3. Only proceed with development work after context files are in place

#### Solution Status: Identified (2025-05-16)
- Current status: Identified but not fixed
- Requires explicit user approval to proceed

## Resolved Issues

### BUG-002: Large Number of Tables Impact Performance
- **Status**: Won't Fix
- **Priority**: Low
- **Description**: With many tables, command registration might become slow
- **Workaround**: Organize tables into separate files

### BUG-003: Commands Not Updating on File Changes
- **Status**: Fixed (2025-05-17)
- **Resolution**: Implemented proper file watching and command reloading
- **Commit**: [commit-hash]

### BUG-004: Memory Leaks in Event Listeners
- **Status**: Fixed (2025-05-17)
- **Resolution**: Added proper cleanup in unload methods
- **Commit**: [commit-hash]