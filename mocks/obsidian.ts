export interface File {
	path: string;
	basename: string;
}

export interface Vault {
	getMarkdownFiles(): File[];
	read(file: File): Promise<string>;
}

export interface Editor {
	replaceRange(text: string, position: { line: number; ch: number }): void;
	getCursor(): { line: number; ch: number };
}

export interface Plugin {
	app: { vault: Vault };
}
