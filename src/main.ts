import { Plugin, Editor } from "obsidian";
import { extractTables } from "./table-utils";

export default class RandomTablePlugin extends Plugin {
	async onload() {
		await this.loadTablesAndRegisterCommands();

		this.addCommand({
			id: "random-table-reload",
			name: "Random Table > Reload Tables",
			callback: () => {
				this.reloadCommands();
			}
		});
	}

	async loadTablesAndRegisterCommands() {
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			if (!file.path.startsWith("RandomTables/")) continue;

			const content = await this.app.vault.read(file);
			const tables = extractTables(content);

			for (const { title, items } of tables) {
				const id = `random-table-${file.basename}-${title}`;
				const name = `Random Table > ${file.basename} > ${title}`;

				this.addCommand({
					id,
					name,
					editorCallback: (editor: Editor) => {
						if (items.length > 0) {
							const choice = items[Math.floor(Math.random() * items.length)];
							editor.replaceRange(choice, editor.getCursor());
						}
					}
				});
			}
		}
	}

	reloadCommands() {
		this.deactivate();
		this.onload();
	}
}
