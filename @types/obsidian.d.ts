declare module 'obsidian' {
    export class Plugin {
        app: App;
        constructor(app: App, manifest: any);
        addCommand(command: any): void;
        registerEvent(callback: any): void;
    }

    export class TFile {
        path: string;
        basename: string;
        stat: {
            size: number;
            mtime: number;
        };
        constructor(path: string, basename: string);
    }

    export class Editor {
        replaceRange(text: string, pos: { line: number; ch: number }): void;
        getCursor(): { line: number; ch: number };
    }

    export interface Vault {
        getMarkdownFiles(): TFile[];
        getAbstractFileByPath(path: string): TFile | null;
        read(file: TFile): Promise<string>;
    }

    export interface App {
        vault: Vault;
        commands: {
            commands: Record<string, any>;
        };
    }
}
