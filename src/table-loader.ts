import { App, TFile, Vault } from 'obsidian';
import { extractTables } from './table-utils';

export interface Table {
  title: string;
  items: string[];
}

export class TableLoader {
  private vault: Vault;
  private tablesDir: string;
  private tables: Table[] = [];
  private eventListeners: (() => void)[] = [];

  constructor(app: App, tablesDir: string) {
    this.vault = app.vault;
    this.tablesDir = tablesDir;
  }

  async loadTables(): Promise<void> {
    try {
      // Clear existing tables
      this.tables = [];

      // Get all markdown files in the tables directory
      const files = this.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(this.tablesDir) && 
        file.extension === 'md'
      );

      // Load tables from each file
      for (const file of files) {
        await this.loadTablesFromFile(file);
      }

      // Set up file watchers
      this.setupFileWatchers();
    } catch (error) {
      console.error('Error loading tables:', error);
      throw error;
    }
  }

  getTables(): Table[] {
    return [...this.tables];
  }

  unload(): void {
    // Clean up event listeners
    this.eventListeners.forEach(remove => remove());
    this.eventListeners = [];
  }

  private async loadTablesFromFile(file: TFile): Promise<void> {
    try {
      const content = await this.vault.read(file);
      const tables = extractTables(content);
      
      // Add source file path to each table
      const tablesWithSource = tables.map(table => ({
        ...table,
        sourceFile: file.path
      }));
      
      this.tables.push(...tablesWithSource);
    } catch (error) {
      console.error(`Error loading tables from ${file.path}:`, error);
      throw error;
    }
  }

  private setupFileWatchers(): void {
    // Watch for file changes
    const modifyHandler = (file: TFile) => {
      if (file.path.startsWith(this.tablesDir) && file.extension === 'md') {
        this.loadTables();
      }
    };

    const createHandler = (file: TFile) => {
      if (file.path.startsWith(this.tablesDir) && file.extension === 'md') {
        this.loadTables();
      }
    };

    const deleteHandler = (file: TFile) => {
      if (file.path.startsWith(this.tablesDir) && file.extension === 'md') {
        this.loadTables();
      }
    };

    // Register event listeners with proper typing
    const modifyRef = this.vault.on('modify', modifyHandler as any);
    const createRef = this.vault.on('create', createHandler as any);
    const deleteRef = this.vault.on('delete', deleteHandler as any);
    
    this.eventListeners.push(
      () => this.vault.offref(modifyRef),
      () => this.vault.offref(createRef),
      () => this.vault.offref(deleteRef)
    );
  }
}
