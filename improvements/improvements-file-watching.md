# Improvements for file-watching.md Task Instructions

## Overview
This document outlines areas where the `file-watching.md` task instructions could be clearer based on the actual implementation experience.

## Key Issues Encountered

### 1. Event Name Consistency
**Issue:** The task shows an example of generating event names based on project path with sanitization, but the backend actually uses a fixed event name "project-kits-changed" for all projects.

**What was unclear:**
- Should event names be unique per project or shared?
- How to match the backend's event naming convention?
- The example shows path sanitization that doesn't match backend implementation

**Suggested improvements:**
- Clarify: "The backend emits a fixed event name 'project-kits-changed' for all projects. Don't generate unique event names per project path."
- Or specify: "Check the backend `watch_project_kits` command to see what event name it emits, and use that exact name in the frontend listener."
- Show the actual event name from backend: `"project-kits-changed"`

### 2. Event Payload Structure
**Issue:** The task doesn't specify what payload the backend sends with events, or how to handle different payload types.

**What was unclear:**
- What data comes with "project-registry-changed" event? (empty payload `()`)
- What data comes with "project-kits-changed" event? (array of file paths)
- How to type the event payload in TypeScript?

**Suggested improvements:**
- Specify payload types:
  - `"project-registry-changed"`: No payload (empty)
  - `"project-kits-changed"`: Array of changed file paths `string[]`
- Show typed listener:
  ```typescript
  const unlisten = await listen<string[]>('project-kits-changed', (event) => {
    const changedFiles = event.payload || [];
    callback(changedFiles);
  });
  ```

### 3. Backend Verification Steps
**Issue:** The task says to "verify" backend file watching, but doesn't specify what to check or how to verify it's working.

**What was unclear:**
- What exactly should be verified?
- How to know if the backend watcher is set up correctly?
- Should we test the backend watcher independently?

**Suggested improvements:**
- Add verification checklist:
  - [ ] `watcher.rs` module exists with `watch_file()`, `watch_directory()`, `get_registry_path()`
  - [ ] `watch_project_kits` command is registered in `lib.rs`
  - [ ] Setup function in `lib.rs` calls `watcher::watch_file()` for registry
  - [ ] Event names match between backend and frontend
- Or specify: "The backend should already be complete from Layer 2. Just verify the files exist and event names match."

### 4. React Hook Pattern
**Issue:** The task mentions using `useEffect` but doesn't show the complete hook pattern with cleanup and error handling.

**What was unclear:**
- Should we create custom hooks or use useEffect directly in components?
- How to handle cleanup properly?
- How to prevent memory leaks?
- How to handle errors in hooks?

**Suggested improvements:**
- Specify: "Create custom hooks in `src/hooks/useFileWatcher.ts` for reusable file watching logic"
- Show complete hook pattern:
  ```typescript
  export function useProjectKitWatcher(projectPath, callback, enabled) {
    const callbackRef = useRef(callback);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
      // Setup listener
      return () => {
        // Cleanup
      };
    }, [projectPath, enabled]);
    
    return { error };
  }
  ```
- Explain: "Use `useRef` for callbacks to avoid stale closures, and return cleanup function from useEffect"

### 5. Callback Ref Pattern
**Issue:** The task doesn't mention the callback ref pattern to avoid stale closures in React hooks.

**What was unclear:**
- Should callbacks be in dependency array?
- How to ensure callbacks are always up-to-date?
- What's the best practice for callbacks in useEffect?

**Suggested improvements:**
- Explain: "Use `useRef` to store callbacks and avoid including them in dependency arrays:
  ```typescript
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Then use callbackRef.current in the listener
  ```"
- Or specify: "Include callbacks in dependency array if you want them to update, but be aware of potential re-subscriptions"

### 6. Error Handling in Hooks
**Issue:** The task mentions error handling but doesn't show how to handle errors in React hooks or return error state.

**What was unclear:**
- Should hooks return error state?
- How to handle errors during listener setup?
- How to handle errors in callbacks?
- Should errors be logged or exposed to components?

**Suggested improvements:**
- Show error handling pattern:
  ```typescript
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    listenToChanges(callback)
      .then((unlisten) => { /* ... */ })
      .catch((err) => {
        setError(err);
        console.error('Failed to set up watcher:', err);
      });
  }, []);
  
  return { error };
  ```
- Specify: "Hooks should return error state so components can handle errors appropriately"

### 7. Mounted State Tracking
**Issue:** The task doesn't mention the need to track mounted state to prevent memory leaks when async operations complete after unmount.

**What was unclear:**
- What happens if component unmounts while setting up listener?
- How to prevent state updates after unmount?
- Should we track mounted state?

**Suggested improvements:**
- Add mounted state tracking:
  ```typescript
  useEffect(() => {
    let isMounted = true;
    
    asyncOperation()
      .then((result) => {
        if (isMounted) {
          // Update state
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []);
  ```
- Explain: "Track mounted state to prevent state updates and memory leaks after component unmounts"

### 8. Unlisten Function Handling
**Issue:** The task shows returning unlisten function but doesn't explain how to handle it in React hooks or what happens if it's null.

**What was unclear:**
- Should unlisten be stored in state or ref?
- What if listener setup fails and unlisten is null?
- How to safely call unlisten in cleanup?

**Suggested improvements:**
- Show pattern:
  ```typescript
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    
    setupListener()
      .then((fn) => {
        unlisten = fn;
      });
    
    return () => {
      if (unlisten) {
        try {
          unlisten();
        } catch (err) {
          console.error('Error cleaning up:', err);
        }
      }
    };
  }, []);
  ```
- Specify: "Store unlisten in local variable, check for null before calling, wrap in try-catch"

### 9. Integration with IPC Commands
**Issue:** The task mentions calling `invokeWatchProjectKits()` but doesn't show when or how to integrate it with the event listener setup.

**What was unclear:**
- Should we call `invokeWatchProjectKits()` before setting up the listener?
- What if the command fails?
- Should we call it every time or only once?
- What's the relationship between the command and the listener?

**Suggested improvements:**
- Clarify: "Call `invokeWatchProjectKits(projectPath)` to start the backend watcher, then set up the frontend event listener. The command starts watching, the listener receives events."
- Show integration:
  ```typescript
  useEffect(() => {
    invokeWatchProjectKits(projectPath)
      .then(() => {
        // Backend watcher started, now set up frontend listener
        return listenToProjectKitChanges(callback);
      })
      .then((unlisten) => {
        // Listener set up
      });
  }, [projectPath]);
  ```

### 10. Event Listener Utility vs Hooks
**Issue:** The task shows utility functions for event listeners, but doesn't clarify when to use utilities vs hooks.

**What was unclear:**
- Should we create both utility functions and hooks?
- When to use utilities directly vs hooks?
- What's the recommended pattern?

**Suggested improvements:**
- Specify: "Create utility functions in `src/utils/fileWatcher.ts` for low-level event listening, then create hooks in `src/hooks/useFileWatcher.ts` that use the utilities. Components should use hooks, not utilities directly."
- Or clarify: "Utilities are for direct event listening, hooks add React lifecycle management. Use hooks in components."

### 11. Multiple Project Watching
**Issue:** The task doesn't address what happens if you want to watch multiple projects simultaneously.

**What was unclear:**
- Can we watch multiple projects at once?
- Do event names conflict?
- How to handle multiple watchers?

**Suggested improvements:**
- Add note: "The current implementation watches one project at a time. If you need multiple projects, you may need to modify the backend to emit project-specific event names, or handle event filtering in the frontend."
- Or specify: "Each project watcher should be in a separate component or managed separately to avoid conflicts"

### 12. Registry Watcher Setup
**Issue:** The task shows listening to registry changes but doesn't mention that the registry watcher is already set up in the backend on app start.

**What was unclear:**
- Do we need to call a command to start registry watching?
- Is it already running?
- When does it start?

**Suggested improvements:**
- Clarify: "The registry file watcher is automatically started in the backend `setup()` function when the app launches. You only need to set up the frontend listener, no command call needed."
- Or specify: "Registry watcher starts automatically. Project kit watcher requires calling `invokeWatchProjectKits()` first."

### 13. Event Name Constants
**Issue:** The task doesn't suggest using constants for event names, which could lead to typos or mismatches.

**What was unclear:**
- Should event names be constants?
- How to ensure frontend and backend use same names?
- What if event names change?

**Suggested improvements:**
- Suggest: "Define event name constants to avoid typos:
  ```typescript
  export const EVENTS = {
    REGISTRY_CHANGED: 'project-registry-changed',
    KITS_CHANGED: 'project-kits-changed',
  } as const;
  ```"
- Or specify: "Use the exact event names from the backend to ensure they match"

### 14. Testing File Watching
**Issue:** The verification steps are vague about how to actually test that file watching works.

**What was unclear:**
- How to test file watching in development?
- What files to create/modify?
- How to verify events are received?
- What should happen in the UI?

**Suggested improvements:**
- Add detailed testing steps:
  1. Start app with `npm run tauri dev`
  2. Open browser console to see event logs
  3. Create a file in `.bluekit/kits/` directory
  4. Verify console shows event received
  5. Verify UI updates (if component is using the hook)
  6. Modify the file
  7. Verify another event is received
- Or specify: "Add console.log in callbacks to verify events are received, then test by creating/modifying files"

### 15. Cleanup on Unmount
**Issue:** The task mentions cleanup but doesn't emphasize how critical it is or show all the places cleanup is needed.

**What was unclear:**
- What happens if cleanup is missed?
- Are there multiple things to clean up?
- When exactly does cleanup run?

**Suggested improvements:**
- Emphasize: "Cleanup is critical to prevent memory leaks. Always return cleanup function from useEffect, and clean up:
  - Event listeners (call unlisten)
  - Async operations (check mounted state)
  - Refs (reset if needed)"
- Show complete cleanup pattern with all cases

### 16. TypeScript Types for Events
**Issue:** The task doesn't show how to properly type Tauri events in TypeScript.

**What was unclear:**
- What type does `listen()` return?
- How to type event payloads?
- What's the event object structure?

**Suggested improvements:**
- Show typed example:
  ```typescript
  import { listen, Event } from '@tauri-apps/api/event';
  
  const unlisten = await listen<string[]>('project-kits-changed', (event: Event<string[]>) => {
    const files = event.payload;
  });
  ```
- Or specify: "Import `Event` type from `@tauri-apps/api/event` for proper typing"

### 17. Error Recovery
**Issue:** The task doesn't address what to do if file watching fails or how to retry.

**What was unclear:**
- Should we retry on failure?
- How to recover from errors?
- Should we disable watching if it fails?

**Suggested improvements:**
- Add error recovery strategy:
  - Log error and continue (non-critical)
  - Retry with exponential backoff
  - Disable watching and show user notification
  - Fall back to polling if watching fails
- Or specify: "For now, log errors and continue. Add retry logic in later iterations if needed"

### 18. Performance Considerations
**Issue:** The task doesn't mention performance implications of file watching or how to optimize.

**What was unclear:**
- Does watching many files impact performance?
- Should we debounce/throttle events?
- How to handle rapid file changes?

**Suggested improvements:**
- Add performance notes:
  - "File watching is efficient, but rapid changes might flood the UI with updates"
  - "Consider debouncing callbacks if files change frequently"
  - "Watch only necessary directories, not entire file system"
- Or specify: "Current implementation is efficient. Add debouncing later if needed for high-frequency changes"

## Additional Suggestions

### 19. Documentation in Code
**Suggestion:** Add JSDoc comments to hooks explaining usage, parameters, return values, and examples.

### 20. Example Component
**Suggestion:** Provide a complete example component showing how to use the file watching hooks in a real scenario.

### 21. Event Payload Validation
**Suggestion:** Add validation for event payloads to ensure they match expected structure before calling callbacks.

### 22. Watcher State Management
**Suggestion:** Consider adding state to track whether watchers are active, which files are being watched, etc.

## Summary
The main themes for improvement are:
1. **Event name and payload clarity** - Exact event names and payload structures from backend
2. **React hook patterns** - Complete patterns with cleanup, error handling, mounted state
3. **Integration guidance** - How to integrate IPC commands with event listeners
4. **Testing procedures** - Step-by-step testing instructions
5. **Error handling** - Comprehensive error handling patterns
6. **Type safety** - Proper TypeScript typing for events and payloads

These improvements would make the file watching implementation much more straightforward and reduce common pitfalls like memory leaks and type mismatches.

