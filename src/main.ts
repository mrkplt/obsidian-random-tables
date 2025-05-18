import { 
  Plugin, 
  App, 
  TAbstractFile, 
  TFile, 
  PluginSettingTab, 
  Setting, 
  AbstractInputSuggest
} from 'obsidian';
import { TableLoader } from './table-loader';
import { CommandLoader } from './command-loader';

interface RandomTableSettings {
	folderLocation: string;
}

const DEFAULT_SETTINGS: RandomTableSettings = {
	folderLocation: 'RandomTables'
}

export default class RandomTable extends Plugin {
  private tableLoader: TableLoader;
  private commandLoader: CommandLoader;
  public manifest: any;
  private fileEventHandlers: Map<string, (file: TAbstractFile) => void>;
  private tablesDir = DEFAULT_SETTINGS.folderLocation;
  
  settings: RandomTableSettings;

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.manifest = manifest;
    this.settings = DEFAULT_SETTINGS;
    this.fileEventHandlers = new Map();
    this.tableLoader = new TableLoader(this.app, this.settings.folderLocation);
    this.commandLoader = new CommandLoader(this.app);
    this.tablesDir = this.settings.folderLocation;
  }

  async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.tablesDir = this.settings.folderLocation;
  }

	async saveSettings() {
		await this.saveData(this.settings);
	}

  async onload() {
    await this.loadSettings();

    console.log('Loading Random Table plugin');
    this.addSettingTab(new RandomTableSettingsTab(this.app, this));

    // Initialize loaders
    this.tableLoader = new TableLoader(this.app, this.settings.folderLocation);
    this.commandLoader = new CommandLoader(this.app);

    // Initial load of tables
    await this.reloadTables();

    // Set up file event listeners
    this.setupFileEventListeners();
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

  async reloadTables(newFolderLocation?: string) {
    try {
      console.log('Reloading random tables...');

      if (newFolderLocation) {
        this.tableLoader = new TableLoader(this.app, newFolderLocation);
        this.tablesDir = newFolderLocation;
      }

      // Load tables from files
      await this.tableLoader.loadTables();
      
      // Register commands for the loaded tables
      const tables = this.tableLoader.getTables();
      console.log(tables);
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

class RandomTableSettingsTab extends PluginSettingTab {
	plugin: RandomTable;

	constructor(app: App, plugin: RandomTable) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
      
    new Setting(containerEl)
    .setName('Folder location')
    .setDesc('Choose a folder.')
    .addSearch(search => {
        search
          .setPlaceholder('Example: folder1/folder2')
          .setValue(this.plugin.settings.folderLocation)
          .onChange(async (value) => {
            this.plugin.settings.folderLocation = value;
            await this.plugin.saveSettings();
            await this.plugin.reloadTables(value);
          });

        // Add folder suggestions
        new FolderSuggest(this.app, search.inputEl);
    });
	}
}

class FolderSuggest extends AbstractInputSuggest<string> {
  private folders: string[];
  private inputEl: HTMLInputElement;
  
  constructor(app: App, inputEl: HTMLInputElement) {
      super(app, inputEl);
      // Get all folders and include root folder
      this.folders = ["/"].concat(this.app.vault.getAllFolders().map(folder => folder.path));
      this.inputEl = inputEl;
  }

  getSuggestions(inputStr: string): string[] {
      const inputLower = inputStr.toLowerCase();
      return this.folders.filter(folder => 
          folder.toLowerCase().includes(inputLower)
      );
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
      el.createEl("div", { text: folder });
  }

  selectSuggestion(folder: string): void {
      this.inputEl.value = folder;
      const event = new Event('input');
      this.inputEl.dispatchEvent(event);
      this.close();
  }
}