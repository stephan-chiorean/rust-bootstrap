import { invoke } from '@tauri-apps/api/tauri';

/**
 * Application information structure matching Rust AppState
 */
export interface AppInfo {
  version: string;
  platform: string;
}

/**
 * Kit file information
 */
export interface KitFile {
  name: string;
  path: string;
  content?: string;
}

/**
 * YAML front matter structure for kits
 */
export interface KitFrontMatter {
  id?: string;
  name?: string;
  description?: string;
  tags?: string[];
  version?: string;
  [key: string]: any;
}

/**
 * Project registry entry
 */
export interface ProjectEntry {
  id: string;
  name: string;
  path: string;
  [key: string]: any;
}

/**
 * Scrapbook item (can be folder or file)
 */
export interface ScrapbookItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
}

/**
 * Blueprint task structure
 */
export interface BlueprintTask {
  id: string;
  taskFile: string;
  description: string;
}

/**
 * Blueprint layer structure
 */
export interface BlueprintLayer {
  id: string;
  order: number;
  name: string;
  tasks: BlueprintTask[];
}

/**
 * Blueprint metadata
 */
export interface BlueprintMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt?: string;
}

/**
 * Complete blueprint structure
 */
export interface Blueprint {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt?: string;
  layers: BlueprintLayer[];
}

/**
 * Simple ping command to test IPC communication
 * @returns Promise resolving to "pong" string
 * @example
 * const result = await invokePing();
 * console.log(result); // "pong"
 */
export async function invokePing(): Promise<string> {
  return invoke<string>('ping');
}

/**
 * Get application information
 * @returns Promise resolving to AppInfo object with version and platform
 * @example
 * const info = await invokeGetAppInfo();
 * console.log(info.version); // "0.1.0"
 * console.log(info.platform); // "darwin" or "windows" etc.
 */
export async function invokeGetAppInfo(): Promise<AppInfo> {
  return invoke<AppInfo>('get_app_info');
}

/**
 * Example error command to demonstrate error handling
 * @param shouldError - If true, returns an error; if false, returns success message
 * @returns Promise resolving to success message or rejecting with error
 * @example
 * try {
 *   const result = await invokeExampleError(false);
 *   console.log(result); // "No error occurred"
 * } catch (error) {
 *   console.error(error); // Error message if shouldError was true
 * }
 */
export async function invokeExampleError(shouldError: boolean): Promise<string> {
  return invoke<string>('example_error', { should_error: shouldError });
}

/**
 * Get all kit files from the project's .bluekit/kits directory
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to array of kit file names
 * @example
 * const kits = await invokeGetProjectKits('/path/to/project');
 * console.log(kits); // ["kit1.md", "kit2.md"]
 */
export async function invokeGetProjectKits(projectPath: string): Promise<string[]> {
  return invoke<string[]>('get_project_kits', { project_path: projectPath });
}

/**
 * Get project registry from ~/.bluekit/projectRegistry.json
 * @returns Promise resolving to project registry JSON object
 * @example
 * const registry = await invokeGetProjectRegistry();
 * console.log(registry); // { projects: [...] }
 */
export async function invokeGetProjectRegistry(): Promise<Record<string, any>> {
  return invoke<Record<string, any>>('get_project_registry');
}

/**
 * Start watching project kits directory for changes
 * Note: This command requires AppHandle in Rust, which Tauri handles automatically
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving when watcher is set up
 * @example
 * await invokeWatchProjectKits('/path/to/project');
 * // Now listening for file changes in .bluekit/kits directory
 */
export async function invokeWatchProjectKits(projectPath: string): Promise<void> {
  return invoke<void>('watch_project_kits', { project_path: projectPath });
}

/**
 * Read a file and return its contents as a string
 * @param path - Full path to the file to read
 * @returns Promise resolving to file contents as string
 * @throws Error if file doesn't exist or cannot be read
 * @example
 * const content = await invokeReadFile('/path/to/file.md');
 * console.log(content); // File contents
 */
export async function invokeReadFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path });
}

/**
 * Copy a kit file from global store to project
 * @param kitName - Name of the kit file to copy
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to success message
 * @example
 * await invokeCopyKitToProject('my-kit.md', '/path/to/project');
 * // Kit copied to project/.bluekit/kits/my-kit.md
 */
export async function invokeCopyKitToProject(
  kitName: string,
  projectPath: string
): Promise<string> {
  return invoke<string>('copy_kit_to_project', {
    kit_name: kitName,
    project_path: projectPath,
  });
}

/**
 * Copy a blueprint to project
 * @param blueprintId - ID of the blueprint to copy
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to success message
 * @example
 * await invokeCopyBlueprintToProject('my-blueprint', '/path/to/project');
 * // Blueprint copied to project/.bluekit/blueprints/my-blueprint/
 */
export async function invokeCopyBlueprintToProject(
  blueprintId: string,
  projectPath: string
): Promise<string> {
  return invoke<string>('copy_blueprint_to_project', {
    blueprint_id: blueprintId,
    project_path: projectPath,
  });
}

/**
 * Get scrapbook items from project
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to array of scrapbook item names
 * @example
 * const items = await invokeGetScrapbookItems('/path/to/project');
 * console.log(items); // ["item1.md", "item2.md"]
 */
export async function invokeGetScrapbookItems(projectPath: string): Promise<string[]> {
  return invoke<string[]>('get_scrapbook_items', { project_path: projectPath });
}

/**
 * Get all markdown files from a folder
 * @param folderPath - Path to the folder to search
 * @returns Promise resolving to array of markdown file names
 * @example
 * const files = await invokeGetFolderMarkdownFiles('/path/to/folder');
 * console.log(files); // ["file1.md", "file2.md"]
 */
export async function invokeGetFolderMarkdownFiles(folderPath: string): Promise<string[]> {
  return invoke<string[]>('get_folder_markdown_files', { folder_path: folderPath });
}

/**
 * Get all blueprints from project
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to array of blueprint IDs/names
 * @example
 * const blueprints = await invokeGetBlueprints('/path/to/project');
 * console.log(blueprints); // ["blueprint1", "blueprint2"]
 */
export async function invokeGetBlueprints(projectPath: string): Promise<string[]> {
  return invoke<string[]>('get_blueprints', { project_path: projectPath });
}

/**
 * Get a specific blueprint task file
 * @param projectPath - Path to the project root directory
 * @param blueprintId - ID of the blueprint
 * @param taskFile - Name of the task file to read
 * @returns Promise resolving to task file contents as string
 * @example
 * const taskContent = await invokeGetBlueprintTaskFile(
 *   '/path/to/project',
 *   'my-blueprint',
 *   'task1.md'
 * );
 * console.log(taskContent); // Task file markdown content
 */
export async function invokeGetBlueprintTaskFile(
  projectPath: string,
  blueprintId: string,
  taskFile: string
): Promise<string> {
  return invoke<string>('get_blueprint_task_file', {
    project_path: projectPath,
    blueprint_id: blueprintId,
    task_file: taskFile,
  });
}

/**
 * Get all diagram files from project
 * @param projectPath - Path to the project root directory
 * @returns Promise resolving to array of diagram file names
 * @example
 * const diagrams = await invokeGetProjectDiagrams('/path/to/project');
 * console.log(diagrams); // ["diagram1.mmd", "diagram2.mmd"]
 */
export async function invokeGetProjectDiagrams(projectPath: string): Promise<string[]> {
  return invoke<string[]>('get_project_diagrams', { project_path: projectPath });
}

