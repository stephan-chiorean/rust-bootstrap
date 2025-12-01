import { listen, UnlistenFn } from '@tauri-apps/api/event';

/**
 * Sets up a listener for project registry changes.
 * The backend emits this event when ~/.bluekit/projectRegistry.json changes.
 * 
 * @param callback - Function to call when registry changes
 * @returns Promise resolving to unlisten function to stop listening
 * @example
 * const unlisten = await listenToRegistryChanges(() => {
 *   console.log('Registry changed!');
 *   // Reload registry data
 * });
 * // Later, to stop listening:
 * await unlisten();
 */
export async function listenToRegistryChanges(
  callback: () => void
): Promise<UnlistenFn> {
  const unlisten = await listen('project-registry-changed', () => {
    callback();
  });
  return unlisten;
}

/**
 * Sets up a listener for project kit changes.
 * The backend emits this event when files in .bluekit/kits directory change.
 * 
 * @param callback - Function to call when kit files change. Receives array of changed file paths.
 * @returns Promise resolving to unlisten function to stop listening
 * @example
 * const unlisten = await listenToProjectKitChanges((changedFiles) => {
 *   console.log('Kits changed:', changedFiles);
 *   // Reload kit list
 * });
 * // Later, to stop listening:
 * await unlisten();
 */
export async function listenToProjectKitChanges(
  callback: (changedFiles: string[]) => void
): Promise<UnlistenFn> {
  // The backend emits "project-kits-changed" event with array of changed file paths
  const unlisten = await listen<string[]>('project-kits-changed', (event) => {
    const changedFiles = event.payload || [];
    callback(changedFiles);
  });
  return unlisten;
}

