import { Plugin, TFile, TAbstractFile } from 'obsidian';

export type FileEventHandler = (file: TFile) => void;

export class FileWatcher {
  private plugin: Plugin;
  private watchPaths: { path: string; fileExtension?: string }[] = [];
  private handlers: Map<string, FileEventHandler> = new Map();
  
  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  /**
   * Add a path to watch for file changes
   * @param path The directory path to watch
   * @param fileExtension Optional file extension to filter by (e.g., 'md')
   * @param handler The function to call when a matching file changes
   */
  public addWatchPath(path: string, handler: FileEventHandler, fileExtension?: string) {
    // Ensure path ends with a slash
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;
    
    // Add to watch paths
    this.watchPaths.push({ 
      path: normalizedPath, 
      fileExtension 
    });
    
    // Store the handler
    const handlerId = `${normalizedPath}:${fileExtension || '*'}`;
    this.handlers.set(handlerId, handler);
    
    // Setup listeners if not already set up
    if (this.watchPaths.length === 1) {
      this.setupEventListeners();
    }
  }

  /**
   * Remove all watchers and clean up event listeners
   */
  public unload() {
    this.watchPaths = [];
    this.handlers.clear();
  }

  private setupEventListeners() {
    // Create a single handler for all file events
    const handleFileEvent = (file: TAbstractFile) => {
      if (!(file instanceof TFile)) return;
      
      // Check each watch path
      for (const { path, fileExtension } of this.watchPaths) {
        if (file.path.startsWith(path)) {
          // If file extension is specified, check it matches
          if (fileExtension && file.extension !== fileExtension) continue;
          
          // Get and call the appropriate handler
          const handlerId = `${path}:${fileExtension || '*'}`;
          const handler = this.handlers.get(handlerId);
          
          if (handler) {
            handler(file);
          }
        }
      }
    };

    // Register event listeners for each event type
    const events = ['modify', 'create', 'delete'];
    
    events.forEach(event => {
      this.plugin.registerEvent(
        this.plugin.app.vault.on(event as any, handleFileEvent)
      );
    });
  }
}
