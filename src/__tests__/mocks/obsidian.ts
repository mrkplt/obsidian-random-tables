// Mock implementations of Obsidian classes

export class Plugin {
  app: any;
  manifest: any;
  
  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }
  
  load() {}
  onload() {}
  onunload() {}
  addCommand(command: any) {}
  registerEvent(event: any) { return () => {}; } // Return a cleanup function
}

export class Editor {
  static replaceRange() {}
  static getCursor() { return { line: 0, ch: 0 }; }
}

export interface FileStats {
  mtime: number;
  size: number;
  ctime: number;
}

export class TFile {
  path: string;
  name: string;
  basename: string;
  extension: string;
  stat: FileStats;
  vault: Vault;
  parent: any; // Simplified for testing
  content: string;

  constructor(vault: Vault, path: string, content: string = '') {
    this.vault = vault;
    this.path = path;
    this.name = path.split('/').pop() || '';
    this.content = content;
    
    // Handle basename and extension
    const lastDot = this.name.lastIndexOf('.');
    if (lastDot > 0) {
      this.basename = this.name.slice(0, lastDot);
      this.extension = this.name.slice(lastDot + 1);
    } else {
      this.basename = this.name;
      this.extension = '';
    }
    
    // Initialize stats
    const now = Date.now();
    this.stat = {
      mtime: now,
      ctime: now,
      size: content.length
    };
    
    // Set up parent
    const parentPath = path.split('/').slice(0, -1).join('/');
    this.parent = { path: parentPath };
  }

  toJSON() {
    return {
      path: this.path,
      name: this.name,
      basename: this.basename,
      extension: this.extension,
      content: this.content,
      stat: this.stat
    };
  }
}

// Extend the global Jest namespace to include our custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Mock<T = any> {
      mockClear(): void;
      mockReset(): void;
      mockImplementation(fn: Function): Mock;
      mockReturnValue(value: any): Mock;
      mockResolvedValue(value: any): Mock;
      mockRejectedValue(value: any): Mock;
      mockImplementationOnce(fn: Function): Mock;
      mockReturnValueOnce(value: any): Mock;
      mockResolvedValueOnce(value: any): Mock;
      mockRejectedValueOnce(value: any): Mock;
      mock: {
        calls: any[];
        instances: any[];
        results: Array<{ type: string; value: any }>;
      };
    }
  }
}

export class Vault {
  private testFiles: Map<string, string> = new Map();
  private eventHandlers: Record<string, Set<Function>> = {};
  
  // Mock implementations of Vault methods
  on = jest.fn(<T extends any[]>(event: string, callback: (...args: T) => any): (() => void) => {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = new Set();
    }
    this.eventHandlers[event].add(callback);
    
    // Return a function to remove the event listener
    return () => {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].delete(callback);
      }
    };
  });
  
  off = jest.fn((event: string, callback: Function) => {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].delete(callback);
    }
  });
  
  // Helper to trigger events in tests
  trigger(event: string, ...args: any[]) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(cb => cb(...args));
    }
  }
  
  // Test helper methods
  addTestFile(path: string, content: string = ''): TFile {
    this.testFiles.set(path, content);
    return new TFile(this, path, content);
  }
  
  clearTestFiles() {
    this.testFiles.clear();
  }
  
  // Vault API methods
  getMarkdownFiles(): TFile[] {
    return Array.from(this.testFiles.entries())
      .filter(([path]) => path.endsWith('.md'))
      .map(([path, content]) => new TFile(this, path, content));
  }
  
  getAbstractFileByPath(path: string): TFile | null {
    return this.testFiles.has(path) 
      ? new TFile(this, path, this.testFiles.get(path) || '') 
      : null;
  }
  
  cachedRead = jest.fn(async (file: TFile): Promise<string> => {
    return this.testFiles.get(file.path) || '';
  });
  
  read = jest.fn(async (file: TFile): Promise<string> => {
    return this.testFiles.get(file.path) || '';
  });
  
  // Mock other commonly used Vault methods
  getRoot() {
    return {
      path: '',
      isRoot: true,
      children: []
    };
  }
  
  getFolderByPath(path: string) {
    return {
      path,
      isRoot: path === '',
      children: []
    };
  }
  
  createFolder(path: string) {
    return Promise.resolve();
  }
  
  create(path: string, content: string) {
    this.testFiles.set(path, content);
    return Promise.resolve(new TFile(this, path, content));
  }
  
  modify(file: TFile, content: string) {
    if (this.testFiles.has(file.path)) {
      this.testFiles.set(file.path, content);
      return Promise.resolve();
    }
    return Promise.reject(new Error('File not found'));
  }
  
  delete(file: TFile) {
    this.testFiles.delete(file.path);
    return Promise.resolve();
  }
}

export interface Command {
  id: string;
  name: string;
  callback?: () => void;
  editorCallback?: (editor: Editor) => void;
}

export class App {
  vault: Vault;
  commands: {
    commands: Record<string, Command>;
    addCommand: jest.Mock<Promise<Command>, [Command]>;
  };
  workspace: {
    getActiveFile: jest.Mock<TFile | null, []>;
    getActiveViewOfType: jest.Mock<any, [any]>;
  };
  
  constructor() {
    this.vault = new Vault();
    
    // Initialize commands with proper typing
    const commands: Record<string, Command> = {};
    
    this.commands = {
      commands,
      addCommand: jest.fn((command: Command) => {
        commands[command.id] = command;
        return Promise.resolve(command);
      })
    };
    
    this.workspace = {
      getActiveFile: jest.fn().mockReturnValue(null),
      getActiveViewOfType: jest.fn().mockReturnValue(null),
    };
    
    // Bind methods to maintain 'this' context
    this.commands.addCommand = this.commands.addCommand.bind(this);
  }
  
  // Add a method to clear all commands for testing
  clearCommands() {
    Object.keys(this.commands.commands).forEach(key => {
      delete this.commands.commands[key];
    });
  }
}

// Export all the types that might be needed
export * from 'obsidian';

// Default export for the module
export default {
  Plugin,
  Editor,
  TFile,
  Vault,
  App,
};
