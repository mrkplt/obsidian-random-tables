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
  separatorAfterInsert: 'none' | 'space' | 'newline';
}

const DEFAULT_SETTINGS: RandomTableSettings = {
	folderLocation: 'RandomTables',
  separatorAfterInsert: 'none'

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
    this.commandLoader = new CommandLoader(this.app, this.settings);
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
    this.commandLoader = new CommandLoader(this.app, this.settings);

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

      // Reload tables from disk
      await this.tableLoader.loadTables();
      const tables = this.tableLoader.getTables();
      
      // Update command loader with latest settings
      this.commandLoader = new CommandLoader(this.app, this.settings);
      
      // Reload commands with the latest tables
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
  private debounceTimeout: number | null = null;

	constructor(app: App, plugin: RandomTable) {
		super(app, plugin);
		this.plugin = plugin;
	}

  private debouncedOnChange = (value: string) => {
    if (this.debounceTimeout !== null) {
        clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = window.setTimeout(async () => {
        this.plugin.settings.folderLocation = value;
        await this.plugin.saveSettings();
        await this.plugin.reloadTables(value);
        this.debounceTimeout = null;
    }, 750);
};

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
      
    new Setting(containerEl)
    .setName('Folder Location')
    .setDesc('Choose the location where your random tables are stored. By default, this is `RandomTables` in the root of your vault. If you rename your folder, you will need to change this setting.')
    .addSearch(search => {
        search.inputEl.parentElement!.style.minWidth = '165px';
        search
          .setPlaceholder('Example: folder1/folder2')
          .setValue(this.plugin.settings.folderLocation)
          .onChange(this.debouncedOnChange);

        // Add folder suggestions
        new FolderSuggest(this.app, search.inputEl);
    });

    new Setting(containerEl)
        .setName('After Insert')
        .setDesc('Once you have inserted the random selection from a table. RandomTables can add a space or a new line after the inserted value. This may useful for keeping you in the flow.')
        .addDropdown(dropdown => {
            dropdown
                .addOption('none', 'Nothing')
                .addOption('space', 'Space')
                .addOption('newline', 'New Line')
                .setValue(this.plugin.settings.separatorAfterInsert)
                .onChange(async (value) => {
                  this.plugin.settings.separatorAfterInsert = value as 'none' | 'space' | 'newline';
                  await this.plugin.saveSettings();
                });
        });
	}

  hide() {
    if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
    }
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