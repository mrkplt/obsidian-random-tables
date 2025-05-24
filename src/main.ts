import { 
  Plugin, 
  App, 
  TFile} from 'obsidian';
import { TableLoader } from './table-loader';
import { CommandLoader } from './command-loader';
import { FileWatcher } from './file-watcher';
import { DEFAULTS, RTSettings, RTSettingsTab, PluginWithSettings } from './settings';

export default class RandomTable extends Plugin implements PluginWithSettings {
  private tableLoader: TableLoader;
  private commandLoader: CommandLoader;
  private fileWatcher: FileWatcher;
  public manifest: any;

  settings: RTSettings;

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.manifest = manifest;
    this.settings = DEFAULTS;
    this.fileWatcher = new FileWatcher(this);
    this.tableLoader = new TableLoader(this, this.app, this.settings.folderLocation);
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
  
    // Set up file event listener for tables folder
    this.fileWatcher.addWatchPath(
      this.settings.folderLocation, 
      () => this.reloadTables(),
      'md'
    );
  }

  async reloadTables(newFolderLocation?: string) {
    try {
      console.log('Loading random tables...');
  
      // Update folder location if provided
      if (newFolderLocation) {
        this.settings.folderLocation = newFolderLocation;
      }
  
      // Initialize/reinitialize loaders with current settings
      this.tableLoader = new TableLoader(this, this.app, this.settings.folderLocation);
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



  onunload() {
    console.log('Unloading Random Table plugin');
    
    // Clean up resources
    if (this.tableLoader) {
      this.tableLoader.unload();
    }
    
    if (this.commandLoader) {
      this.commandLoader.unloadCommands();
    }
    
    // Clean up file watchers
    if (this.fileWatcher) {
      this.fileWatcher.unload();
    }
  }
}
