import { Plugin, Editor, TFile } from "obsidian";
import { extractTables } from "./table-utils.js";

export default class RandomTablePlugin extends Plugin {
	private registeredCommands: string[] = [];

	async onload() {
		// Register the reload command
		this.addCommand({
			id: "random-table-reload",
			name: "Random Table > Reload Tables",
			callback: () => this.reloadCommands()
		});

		// Set up file system event listeners
		this.setupFileSystemEventListeners();

		// Load tables and register commands
		await this.loadTablesAndRegisterCommands();
	}

	setupFileSystemEventListeners() {
		// Register event listeners for file changes in the RandomTables directory
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile && file.path.startsWith("RandomTables/") && file.path.endsWith('.md')) {
					this.handleFileChange(file);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile && file.path.startsWith("RandomTables/") && file.path.endsWith('.md')) {
					this.handleFileChange(file);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile && file.path.startsWith("RandomTables/") && file.path.endsWith('.md')) {
					this.handleFileDelete(file);
				}
			})
		);
	}

	async handleFileChange(file: TFile) {
		try {
			// Clear any existing commands for this file
			this.clearCommandsForFile(file.path);

			// Read the file and register new commands
			const content = await this.app.vault.read(file);
			const tables = extractTables(content);

			for (const { title, items } of tables) {
				const id = this.generateCommandId(file.basename, title);
				const name = `Random Table > ${file.basename} > ${title}`;

				if (items.length > 0) {
					this.addCommand({
						id,
						name,
						editorCallback: (editor: Editor) => {
							const choice = items[Math.floor(Math.random() * items.length)];
							editor.replaceRange(choice, editor.getCursor());
						}
					});
					this.registeredCommands.push(id);
				}
			}
		} catch (error) {
			console.error(`Error processing file ${file.path}:`, error);
		}
	}

	handleFileDelete(file: TFile) {
		this.clearCommandsForFile(file.path);
	}

	clearCommandsForFile(filePath: string) {
		// Remove commands associated with this file
		const prefix = `random-table-${filePath.split('/').pop()?.replace(/\.md$/, '')}-`;
		const commandsToRemove = this.registeredCommands.filter(id => id.startsWith(prefix));
		
		for (const id of commandsToRemove) {
			// @ts-ignore - Private API access
			delete this.app.commands.commands[`${this.manifest.id}:${id}`];
			this.registeredCommands = this.registeredCommands.filter(cmdId => cmdId !== id);
		}
	}

	generateCommandId(basename: string, title: string): string {
		return `random-table-${basename}-${title}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
	}

	async loadTablesAndRegisterCommands() {
		try {
			// Clear any previously registered commands
			for (const id of this.registeredCommands) {
				// @ts-ignore - Private API access
				delete this.app.commands.commands[`${this.manifest.id}:${id}`];
			}
			this.registeredCommands = [];

			const files = this.app.vault.getMarkdownFiles();

			for (const file of files) {
				if (!file.path.startsWith("RandomTables/") || !file.path.endsWith('.md')) continue;

				try {
					await this.handleFileChange(file);
				} catch (error) {
					console.error(`Error processing file ${file.path}:`, error);
				}
			}
		} catch (error) {
			console.error('Error loading tables:', error);
		}
	}

	async reloadCommands() {
		console.log('Reloading Random Table commands...');
		await this.loadTablesAndRegisterCommands();
	}

	async onunload() {
		// No explicit cleanup needed - Obsidian handles unregistering events
	}
}
