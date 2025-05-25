import { PluginSettingTab, App, Setting, AbstractInputSuggest, TFile } from 'obsidian';

export interface RTSettings {
  folderLocation: string;
  separatorAfterInsert: 'none' | 'space' | 'newline';
}
export const DEFAULTS: RTSettings = {
  folderLocation: 'RandomTables',
  separatorAfterInsert: 'none'
};

export interface PluginWithSettings {
  settings: RTSettings;
  saveSettings(): Promise<void>;
  reloadTables(object: { newFolderLocation?: string; file?: TFile }): Promise<void>;
}

export class RTSettingsTab extends PluginSettingTab {
  plugin: PluginWithSettings;
  private debounceTimeout: number | null = null;

  constructor(app: App, plugin: PluginWithSettings) {
    super(app, plugin as any);
    this.plugin = plugin;
  }

  private debouncedOnChange = (value: string) => {
    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(async () => {
      this.plugin.settings.folderLocation = value;
      await this.plugin.saveSettings();
      await this.plugin.reloadTables({ newFolderLocation: value });
      this.debounceTimeout = null;
    }, 750);
  };

  display(): void {
    const { containerEl } = this;
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
export class FolderSuggest extends AbstractInputSuggest<string> {
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
    return this.folders.filter(folder => folder.toLowerCase().includes(inputLower)
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

