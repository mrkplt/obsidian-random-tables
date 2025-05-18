import { App, TFile, Vault } from 'obsidian';
import { extractTables } from './table-utils';

export interface Table {
  title: string;
  items: string[];
  fileName: string;
}

export class TableLoader {
  private vault: Vault;
  private tablesDir: string;
  private tables: Table[] = [];
  private tablesMap: Record<string, Table> = {};
  private eventListeners: (() => void)[] = [];
  private isInitialized = false;

  constructor(app: App, tablesDir: string) {
    this.vault = app.vault;
    this.tablesDir = tablesDir.endsWith('/') ? tablesDir : `${tablesDir}/`;
  }

  async loadTables(): Promise<void> {
    try {
      // Clear existing tables
      this.tables = [];
      this.tablesMap = {};

      // Get all markdown files in the tables directory
      const files = this.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(this.tablesDir) && 
        file.extension === 'md' &&
        !file.path.includes('/.trash/') // Skip files in trash
      );

      // Load tables from each file
      await Promise.all(files.map(file => this.loadTablesFromFile(file)));

      // Set up file watchers on first load
      if (!this.isInitialized) {
        this.setupFileWatchers();
        this.isInitialized = true;
      }
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
      const tables = extractTables(file.name, content);
      
      // Add source file path to each table and update both array and map
      tables.forEach(table => {
        const tableWithSource = {
          ...table,
          sourceFile: file.path
        };
        
        // Generate a unique key for the table
        const tableKey = `${file.name}:${table.title}`.toLowerCase();
        
        // Update the map
        this.tablesMap[tableKey] = tableWithSource;
      });
      
      // Rebuild the array from the map to ensure consistency
      this.tables = Object.values(this.tablesMap);
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
