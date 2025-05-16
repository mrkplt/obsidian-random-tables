import { Plugin, Editor } from "obsidian";
import { extractTables } from "./table-utils";

export default class RandomTablePlugin extends Plugin {
	private registeredCommands: string[] = [];

	async onload() {
		// Register the reload command
		this.addCommand({
			id: "random-table-reload",
			name: "Random Table > Reload Tables",
			callback: () => this.reloadCommands()
		});

		// Load tables and register commands
		await this.loadTablesAndRegisterCommands();
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
				if (!file.path.startsWith("RandomTables/")) continue;

				try {
					const content = await this.app.vault.read(file);
					const tables = extractTables(content);

					for (const { title, items } of tables) {
						const id = `random-table-${file.basename}-${title}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
						const name = `Random Table > ${file.basename} > ${title}`;

						// Only add the command if there are items
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
		} catch (error) {
			console.error('Error loading tables:', error);
		}
	}

	async reloadCommands() {
		console.log('Reloading Random Table commands...');
		await this.loadTablesAndRegisterCommands();
	}
}
