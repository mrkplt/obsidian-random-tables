import { App, Editor } from 'obsidian';
import { Table } from './table-loader';
import { NakedTableName } from './table-utils'

interface Command {
  id: string;
  name: string;
  callback: (editor?: Editor) => void | Promise<void>;
  editorCallback?: (editor: Editor) => void;
}

export class CommandLoader {
  private app: App;
  private registeredCommands: Command[] = [];

  constructor(app: App) {
    this.app = app;
  }

  async loadCommands(tables: Table[]): Promise<void> {
    // Clear existing commands first
    await this.unloadCommands();


    // Register a command for each table
    for (const table of tables) {
      if (!table || !table.title || !table.items || table.items.length === 0 || !table.fileName) {
        console.warn('Skipping invalid table:', table);
        continue;
      }

      const fileNameKey = table.fileName.toLowerCase().replace(/\s+/g, '-');
      const titleKey = table.title.toLowerCase().replace(/\s+/g, '-');
      const id = `random-tables-${fileNameKey}-${titleKey}`;

      const name = table.title == NakedTableName ? 
        `Random Tables: Insert ${table.fileName}` : 
        `Random Tables: Insert ${table.fileName} > ${table.title}`;

      const command: Command = {
        id: id,
        name: name,
        callback: async (editor?: Editor) => {
          try {
            const randomIndex = Math.floor(Math.random() * table.items.length);
            const randomItem = table.items[randomIndex];
            const textToInsert = typeof randomItem === 'string' ? randomItem : JSON.stringify(randomItem);
            
            if (editor) {
              // If we have an editor, insert at cursor
              editor.replaceSelection(textToInsert);
            } else {
              // Otherwise, try to get the active editor
              const activeLeaf = this.app.workspace.activeLeaf;
              if (activeLeaf?.view.getViewType() === 'markdown') {
                const view = activeLeaf.view as any;
                if (view.editor) {
                  view.editor.replaceSelection(textToInsert);
                }
              }
            }
          } catch (error) {
            console.error('Error executing command:', error);
          }
        },
        editorCallback: (editor: Editor) => {
          // Use the current command's callback
          if (command.callback) {
            return command.callback(editor);
          }
        }
      };

      // Add the command to the app
      // @ts-ignore - We're mocking this in tests
      this.app.commands.addCommand({
        id: command.id,
        name: command.name,
        callback: () => command.callback(),
        editorCallback: command.editorCallback
      });
      
      this.registeredCommands.push(command);
    }
  }

  async unloadCommands(): Promise<void> {
    // Make a copy of the array to avoid modification during iteration
    const commandsToRemove = [...this.registeredCommands];
    this.registeredCommands = [];
    
    // Unregister all commands
    for (const command of commandsToRemove) {
      try {
        // @ts-ignore - The Obsidian types don't expose removeCommand, but it exists
        this.app.commands.removeCommand(command.id);
      } catch (error) {
        console.warn(`Failed to unregister command ${command.id}:`, error);
      }
    }
  }
}
