import { App, Plugin, TFile, Vault } from 'obsidian';
import { extractTables } from './table-utils';

export interface Table {
  title: string;
  items: string[];
  fileName: string;
  sourceFile: string;
}

export class TableLoader {
  private vault: Vault;
  private tablesDir: string;
  private tables: Table[] = [];

  constructor(plugin: Plugin, app: App, tablesDir: string) {
    this.vault = app.vault;
    this.tablesDir = tablesDir.endsWith('/') ? tablesDir : `${tablesDir}/`;
  }

  async loadTables(file?: TFile): Promise<void> {
    if (!file) {
      try {
        // Get all markdown files in the tables directory
        const files = this.vault.getMarkdownFiles().filter(file => 
          file.path.startsWith(this.tablesDir) && 
          file.extension === 'md' &&
          !file.path.includes('/.trash/') // Skip files in trash
        );

        await Promise.all(files.map(file => this.loadTablesFromFile(file)));
        
      } catch (error) {
        console.error('Tables failed to load.', error);
        throw error;
      }
    } else if (file) {
      try {
        await this.loadTablesFromFile(file);
      } catch (error) {
        console.error(`Tables failed to load from ${file.path}.`, error);
        throw error;
      }
    }
  }

  getTables(): Table[] {
    return [...this.tables];
  }

  unload(): void {
    // Clean up resources if needed
    this.tables = [];
  }

  private async loadTablesFromFile(file: TFile): Promise<void> {
    try {
      const content = await this.vault.read(file);
      const tables = extractTables(file.name, content);
      
      // Add source file path to each table
      const tablesWithSource = tables.map(table => ({
        ...table,
        sourceFile: file.path
      }));
      
      // Add to tables array
      this.tables.push(...tablesWithSource);
    } catch (error) {
      console.error(`Tables failed to load from ${file.path}.`, error);
      throw error;
    }
  }
} 
