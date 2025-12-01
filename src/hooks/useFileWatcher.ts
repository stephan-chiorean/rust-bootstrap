import { useEffect, useRef, useState } from 'react';
import { listenToRegistryChanges, listenToProjectKitChanges } from '../utils/fileWatcher';
import { invokeWatchProjectKits } from '../ipc';

/**
 * Hook to listen for project registry changes
 * @param callback - Function to call when registry changes
 * @param enabled - Whether the listener should be active (default: true)
 * @returns Object with error state if listener setup fails
 */
export function useRegistryWatcher(
  callback: () => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  const [error, setError] = useState<Error | null>(null);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    let unlisten: (() => void) | null = null;
    let isMounted = true;

    listenToRegistryChanges(() => {
      if (isMounted) {
        try {
          callbackRef.current();
        } catch (err) {
          console.error('Error in registry change callback:', err);
        }
      }
    })
      .then((fn) => {
        if (isMounted) {
          unlisten = fn;
          setError(null);
        } else {
          // Component unmounted before listener was set up, clean up immediately
          fn();
        }
      })
      .catch((err) => {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('Failed to set up registry watcher:', error);
        }
      });

    return () => {
      isMounted = false;
      if (unlisten) {
        try {
          unlisten();
        } catch (err) {
          console.error('Error cleaning up registry watcher:', err);
        }
      }
    };
  }, [enabled]);

  return { error };
}

/**
 * Hook to listen for project kit changes
 * @param projectPath - Path to the project root directory
 * @param callback - Function to call when kit files change. Receives array of changed file paths.
 * @param enabled - Whether the listener should be active (default: true)
 * @returns Object with error state if listener setup fails
 */
export function useProjectKitWatcher(
  projectPath: string | null,
  callback: (changedFiles: string[]) => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  const [error, setError] = useState<Error | null>(null);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !projectPath) {
      setError(null);
      return;
    }

    let unlisten: (() => void) | null = null;
    let isMounted = true;

    // Start watching the project kits directory
    invokeWatchProjectKits(projectPath)
      .then(() => {
        if (!isMounted) return;
        // Set up event listener
        return listenToProjectKitChanges((changedFiles) => {
          if (isMounted) {
            try {
              callbackRef.current(changedFiles);
            } catch (err) {
              console.error('Error in project kit change callback:', err);
            }
          }
        });
      })
      .then((fn) => {
        if (isMounted && fn) {
          unlisten = fn;
          setError(null);
        } else if (fn) {
          // Component unmounted before listener was set up, clean up immediately
          fn();
        }
      })
      .catch((err) => {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('Failed to set up project kit watcher:', error);
        }
      });

    return () => {
      isMounted = false;
      if (unlisten) {
        try {
          unlisten();
        } catch (err) {
          console.error('Error cleaning up project kit watcher:', err);
        }
      }
    };
  }, [projectPath, enabled]);

  return { error };
}

