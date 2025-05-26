import { jest } from '@jest/globals';
import { CommandLoader } from '../command-loader';
import { Table } from '../table-loader';
import { NakedTableName } from '../table-utils';

describe('CommandLoader', () => {
  let mockApp: any;
  let commandLoader: CommandLoader;
  let mockCommands: any;
  
  const mockTable1: Table = {
    fileName: 'weapons',
    sourceFile: 'weapons.md',
    title: 'Weapons',
    items: ['Sword', 'Axe', 'Dagger']
  };

  const mockNakedTable: Table = {
    fileName: 'armor',
    sourceFile: 'armor.md',
    title: NakedTableName,
    items: ['Leather', 'Chainmail', 'Plate']
  };

  beforeEach(() => {
    // Create a mock for the commands API
    mockCommands = {
      commands: {},
      addCommand: jest.fn().mockImplementation((args: any) => {
        const cmd = { id: args.id, name: args.name, callback: args.callback, editorCallback: args.editorCallback };
        mockCommands.commands[args.id] = cmd;
        return cmd;
      }),
      removeCommand: jest.fn().mockImplementation((args: any) => {
        delete mockCommands.commands[args.id];
        return true;
      })
    };

    // Create a mock app with the commands API
    mockApp = {
      commands: mockCommands,
      workspace: {
        activeLeaf: {
          view: {
            getViewType: () => 'markdown',
            editor: {
              replaceSelection: jest.fn()
            }
          }
        }
      }
    };

    commandLoader = new CommandLoader(mockApp as any, {} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadCommands', () => {
    it('should load commands for each table', async () => {
      await commandLoader.loadCommands([mockTable1, mockNakedTable]);
      
      expect(mockApp.commands.addCommand).toHaveBeenCalledTimes(2);
      
      // Get the registered commands
      const cmd1 = mockCommands.commands['weapons-weapons'];
      const cmd2 = mockCommands.commands['armor-rtnakedlist'];
      
      expect(cmd1).toBeDefined();
      expect(cmd1.id).toBe('weapons-weapons');
      expect(cmd1.name).toBe('Random Tables: Insert weapons > Weapons');
      expect(cmd1.callback).toBeInstanceOf(Function);
      expect(cmd1.editorCallback).toBeInstanceOf(Function);
      
      expect(cmd2).toBeDefined();
      expect(cmd2.id).toBe('armor-rtnakedlist');
      expect(cmd2.name).toBe('Random Tables: Insert armor');
      expect(cmd2.callback).toBeInstanceOf(Function);
      expect(cmd2.editorCallback).toBeInstanceOf(Function);
    });

    it('should skip invalid tables', async () => {
      const invalidTables = [
        { ...mockTable1, title: '' },
        null,
        undefined,
        { ...mockTable1, items: [] },
        { ...mockTable1, fileName: '' }
      ];
      
      // Clear previous calls
      (mockApp.commands.addCommand as jest.Mock).mockClear();
      
      await commandLoader.loadCommands(invalidTables as any);
      
      // Should not have added any commands
      expect(mockApp.commands.addCommand).not.toHaveBeenCalled();
    });
  });

  describe('unloadCommands', () => {
    it('should unload all registered commands', async () => {
      await commandLoader.loadCommands([mockTable1, mockNakedTable]);
      await commandLoader.unloadCommands();
      
      expect(mockApp.commands.removeCommand).toHaveBeenCalledTimes(2);
      expect(mockApp.commands.removeCommand).toHaveBeenCalledWith('weapons-weapons');
      expect(mockApp.commands.removeCommand).toHaveBeenCalledWith('armor-rtnakedlist');
    });

    it('should handle errors during command removal', async () => {
      mockApp.commands.removeCommand = jest.fn()
        .mockImplementationOnce(() => { throw new Error('Failed to remove'); })
        .mockImplementationOnce(() => {});
      
      await commandLoader.loadCommands([mockTable1, mockNakedTable]);
      await commandLoader.unloadCommands();
      
      expect(mockApp.commands.removeCommand).toHaveBeenCalledTimes(2);
    });
  });

  describe('command execution', () => {
    let mockEditor: any;
    let mockApp: any;
    let commandLoader: CommandLoader;
    
    beforeEach(() => {
      mockEditor = { replaceSelection: jest.fn() };
      mockApp = {
        settings: { debug: true },
        commands: mockCommands,
        vault: { getMarkdownFiles: jest.fn().mockReturnValue([{ path: 'weapons.md' }, { path: 'armor.md' }]) },
        workspace: { activeLeaf: { view: { getViewType: () => 'markdown', editor: mockEditor } } }
      };
      commandLoader = new CommandLoader(mockApp, mockApp.settings);
    });

    it('should insert random item when command is executed', async () => {
      await commandLoader.loadCommands([mockTable1]);
      
      // Get the registered command
      const command = mockCommands.commands['weapons-weapons'];
      expect(command).toBeDefined();
      
      // Reset mock before test
      (mockApp.workspace.activeLeaf.view.editor.replaceSelection as jest.Mock).mockClear();
      
      // Execute the command
      await command.callback();
      
      // Should have called replaceSelection with one of the items
      expect(mockApp.workspace.activeLeaf.view.editor.replaceSelection).toHaveBeenCalledWith(
        expect.stringMatching(/^(Sword|Axe|Dagger)$/)
      );
    });

    it('should handle missing editor when executing command', async () => {
      // Mock active leaf with markdown view but no editor
      const mockLeaf = {
        view: {
          getViewType: () => 'markdown',
          editor: null
        }
      };
      
      mockApp.workspace.activeLeaf = mockLeaf;
      
      await commandLoader.loadCommands([mockTable1]);
      const command = mockCommands.commands['weapons-weapons'];
      
      // This should not throw
      await expect(command.callback()).resolves.not.toThrow();
    });

    it('should skip invalid tables', async () => {
      // Create an invalid table (missing items)
      const invalidTable = {
        ...mockTable1,
        items: []
      };
      
      // Mock console.log to verify the warning is logged
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      
      try {
        // Load the invalid table
        await commandLoader.loadCommands([invalidTable]);
        
        // The command should not be registered for an invalid table
        expect(mockCommands.commands['weapons-weapons']).toBeUndefined();
        
        // Verify the warning was logged
        expect(debugSpy).toHaveBeenCalled();
      } finally {
        // Restore console.log
        debugSpy.mockRestore();
      }
    });
    
    it('should not register commands for invalid tables', async () => {
      // Mock console.log to verify the warning is logged
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      
      try {
        // Load with null table (should be skipped)
        await commandLoader.loadCommands([null as any]);
        
        // No commands should be registered
        expect(Object.keys(mockCommands.commands)).toHaveLength(0);
        
        // Verify the warning was logged
        expect(debugSpy).toHaveBeenCalledWith('Skipping invalid table null.');
      } finally {
        // Restore console.   
        debugSpy.mockRestore();
      }
    });
  });
});
