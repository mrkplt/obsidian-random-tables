import { Plugin, App, TAbstractFile, TFile } from 'obsidian';
import { TableLoader } from './table-loader';
import { CommandLoader } from './command-loader';

export default class RandomTable extends Plugin {
  private tableLoader: TableLoader;
  private commandLoader: CommandLoader;
  private tablesDir = 'RandomTables';
  public manifest: any;
  private fileEventHandlers: Map<string, (file: TAbstractFile) => void>;

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.manifest = manifest;
    this.fileEventHandlers = new Map();
    this.tableLoader = new TableLoader(this.app, 'RandomTables');
    this.commandLoader = new CommandLoader(this.app);
  }

  async onload() {
    console.log('Loading Random Table plugin');

    // Initialize loaders
    this.tableLoader = new TableLoader(this.app, this.tablesDir);
    this.commandLoader = new CommandLoader(this.app);

    // Register the reload command
    this.addCommand({
      id: 'random-table-reload',
      name: 'Random Table > Reload Tables',
      callback: () => this.reloadTables()
    });

    // Set up file event listeners
    this.setupFileEventListeners();

    // Initial load of tables
    await this.reloadTables();
  }

  private setupFileEventListeners() {
    const handleFileEvent = (file: TAbstractFile) => {
      if (file instanceof TFile && file.path.startsWith(this.tablesDir)) {
        this.reloadTables();
      }
    };

    // Store the handler so we can remove it later
    this.fileEventHandlers.set('modify', handleFileEvent);
    this.fileEventHandlers.set('create', handleFileEvent);
    this.fileEventHandlers.set('delete', handleFileEvent);

    // Register the event listeners
    this.fileEventHandlers.forEach((handler, event) => {
      this.registerEvent(this.app.vault.on(event as any, handler));
    });
  }

  async reloadTables() {
    try {
      console.log('Reloading random tables...');
      
      // Load tables from files
      await this.tableLoader.loadTables();
      
      // Register commands for the loaded tables
      const tables = this.tableLoader.getTables();
      await this.commandLoader.loadCommands(tables);
      
      console.log(`Loaded ${tables.length} tables`);
    } catch (error) {
      console.error('Error reloading tables:', error);
    }
  }

  onunload() {
    console.log('Unloading Random Table plugin');
    
    // Clean up resources
    if (this.tableLoader) {
      this.tableLoader.unload();
    }
    
    if (this.commandLoader) {
      this.commandLoader.unloadCommands();
    }
    
    // Clear event handlers
    this.fileEventHandlers.clear();
  }
}
