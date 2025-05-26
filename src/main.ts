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
  
    console.debug('Loading plugin.');
    this.addSettingTab(new RTSettingsTab(this.app, this));
  
    // Initial load of tables and commands
    this.app.workspace.onLayoutReady(async () => {
      await this.reloadTables();
    
      // Set up file event listener for tables folder
      this.fileWatcher.addWatchPath(
        this.settings.folderLocation, 
        (file) => this.reloadTables({file: file}),
        'md'
      );
    });
  }

  async reloadTables({ newFolderLocation, file }: {newFolderLocation?: string, file?: TFile} = {}) {
    try {
      console.debug('Loading tables.');
  
      // Update folder location if provided
      if (newFolderLocation) {
        this.settings.folderLocation = newFolderLocation;
      }
  
      // Initialize/reinitialize loaders with current settings
      this.tableLoader = new TableLoader(this, this.app, this.settings.folderLocation);
      this.commandLoader = new CommandLoader(this.app, this.settings);
  
      // Load tables from disk
      await this.tableLoader.loadTables(file);
      const tables = this.tableLoader.getTables();
      
      // Load commands with the tables
      await this.commandLoader.loadCommands(tables);
      
      console.debug(`Loaded ${tables.length} tables.`);
    } catch (error) {
      console.error('Failed to reload tables.', error);
    }
  }



  onunload() {
    console.debug('Unloading Random Table plugin');
    
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
