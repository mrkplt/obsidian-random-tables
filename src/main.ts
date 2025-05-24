import { 
  Plugin, 
  App, 
  TAbstractFile, 
  TFile} from 'obsidian';
import { TableLoader } from './table-loader';
import { CommandLoader } from './command-loader';
import { DEFAULTS, RTSettings, RTSettingsTab, PluginWithSettings } from './settings';

export default class RandomTable extends Plugin implements PluginWithSettings {
  private tableLoader: TableLoader;
  private commandLoader: CommandLoader;
  public manifest: any;
  private fileEventHandlers: Map<string, (file: TAbstractFile) => void>;

  settings: RTSettings;

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.manifest = manifest;
    this.settings = DEFAULTS;
    this.fileEventHandlers = new Map();
    this.tableLoader = new TableLoader(this.app, this.settings.folderLocation);
    this.commandLoader = new CommandLoader(this.app, this.settings);
  }

  async loadSettings() {
		this.settings = { ...DEFAULTS, ...(await this.loadData()) };
  }

	async saveSettings() {
		await this.saveData(this.settings);
	}

  async onload() {
    await this.loadSettings();
  
    console.log('Loading Random Table plugin');
    this.addSettingTab(new RTSettingsTab(this.app, this));
  
    // Initial load of tables and commands
    await this.reloadTables();
  
    // Set up file event listeners
    this.setupFileEventListeners();
  }

  async reloadTables(newFolderLocation?: string) {
    try {
      console.log('Reloading random tables...');
  
      // Update folder location if provided
      if (newFolderLocation) {
        this.settings.folderLocation = newFolderLocation;
      }
  
      // Initialize/reinitialize loaders with current settings
      this.tableLoader = new TableLoader(this.app, this.settings.folderLocation);
      this.commandLoader = new CommandLoader(this.app, this.settings);
  
      // Load tables from disk
      await this.tableLoader.loadTables();
      const tables = this.tableLoader.getTables();
      
      // Load commands with the tables
      await this.commandLoader.loadCommands(tables);
      
      console.log(`Loaded ${tables.length} tables`);
    } catch (error) {
      console.error('Error reloading tables:', error);
    }
  }

  private setupFileEventListeners() {
    const handleFileEvent = (file: TAbstractFile) => {
      if (file instanceof TFile && file.path.startsWith(this.settings.folderLocation)) {
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
