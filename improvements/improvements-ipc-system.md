# Improvements for ipc-system.md Task Instructions

## Overview
This document outlines areas where the `ipc-system.md` task instructions could be clearer based on the actual implementation experience.

## Key Issues Encountered

### 1. Type Definitions vs Actual Rust Structs
**Issue:** The task lists type definitions to create, but some of them (like `KitFile`, `KitFrontMatter`, `BlueprintTask`, etc.) don't actually exist as Rust structs in the backend.

**What was unclear:**
- Which types actually need to match Rust structs vs which are just TypeScript-only types?
- The task says "Each interface must exactly match the corresponding Rust struct" but many listed types don't have Rust counterparts
- Should we create types that don't exist in Rust, or only create types for existing Rust structs?

**Suggested improvements:**
- Clarify: "Only `AppInfo` directly matches a Rust struct (`AppState`). Other types are TypeScript-only interfaces for future use or for structuring data returned from commands."
- Or specify: "Create types for:
  - Rust structs that exist (AppInfo matches AppState)
  - Types needed for command return values (even if Rust returns Vec<String> or serde_json::Value)
  - Types for future use in UI components"
- Provide a mapping: "Rust `AppState` → TypeScript `AppInfo`, Rust `Vec<String>` → TypeScript `string[]`, etc."

### 2. Parameter Naming Convention
**Issue:** Rust uses snake_case for parameters (e.g., `project_path`, `kit_name`), but the task doesn't specify how to handle this in TypeScript.

**What was unclear:**
- Should TypeScript functions use camelCase or snake_case?
- How to map Rust parameter names to TypeScript?
- Should the invoke call use snake_case to match Rust exactly?

**Suggested improvements:**
- Specify: "TypeScript function parameters should use camelCase (e.g., `projectPath`), but when calling `invoke()`, convert to snake_case to match Rust:
  ```typescript
  export async function invokeGetProjectKits(projectPath: string) {
    return invoke<string[]>('get_project_kits', { project_path: projectPath });
  }
  ```"
- Or provide a helper function for automatic conversion

### 3. Return Type Inference
**Issue:** The task mentions using TypeScript generics but doesn't show the exact pattern for `invoke<T>()`.

**What was unclear:**
- Exact syntax for generic invoke calls
- How to handle different return types (string, string[], object, void)
- Whether to use `invoke<T>()` or just rely on type inference

**Suggested improvements:**
- Show exact pattern:
  ```typescript
  export async function invokePing(): Promise<string> {
    return invoke<string>('ping');
  }
  
  export async function invokeGetAppInfo(): Promise<AppInfo> {
    return invoke<AppInfo>('get_app_info');
  }
  
  export async function invokeWatchProjectKits(projectPath: string): Promise<void> {
    return invoke<void>('watch_project_kits', { project_path: projectPath });
  }
  ```
- Explain: "Always specify the generic type parameter `T` in `invoke<T>()` to ensure type safety"

### 4. Error Handling Documentation
**Issue:** The task mentions error handling but doesn't specify how errors are handled in the TypeScript wrappers.

**What was unclear:**
- Do errors come through as rejected promises?
- Should functions include try-catch in JSDoc examples?
- How to document error cases?

**Suggested improvements:**
- Add error handling pattern:
  ```typescript
  /**
   * @throws Error if file doesn't exist or cannot be read
   * @example
   * try {
   *   const content = await invokeReadFile('/path/to/file');
   * } catch (error) {
   *   console.error('Failed to read file:', error);
   * }
   */
  ```
- Specify: "All Tauri commands return `Result<T, String>` in Rust, which translates to `Promise<T>` that rejects with a string error message in TypeScript"

### 5. AppHandle Parameter Handling
**Issue:** The `watch_project_kits` command takes `AppHandle` in Rust, but the task doesn't explain how this is handled in TypeScript.

**What was unclear:**
- Should AppHandle be a parameter in TypeScript?
- How does Tauri handle AppHandle automatically?
- Do we need to pass anything special?

**Suggested improvements:**
- Add note: "Commands that require `AppHandle` in Rust (like `watch_project_kits`) don't need it as a parameter in TypeScript. Tauri automatically provides the AppHandle to the Rust command. Just pass the other parameters normally."

### 6. Type Definitions That Don't Exist
**Issue:** The task lists many type definitions, but some don't correspond to actual Rust structs or aren't used by any commands.

**What was unclear:**
- Should we create all listed types even if they're not used?
- Are these types for future use?
- Which types are actually needed now vs later?

**Suggested improvements:**
- Categorize types:
  - **Required now**: Types that match Rust structs or are returned by commands
  - **Future use**: Types that will be used in UI components but aren't returned by commands yet
  - **Optional**: Types that might be useful but aren't strictly necessary
- Or specify: "Create types as needed. Start with types that match Rust structs, then add others as you implement UI components."

### 7. JSDoc Documentation Standards
**Issue:** The task says to include JSDoc but doesn't specify the exact format or required fields.

**What was unclear:**
- What JSDoc tags to use (@param, @returns, @throws, @example)?
- How detailed should descriptions be?
- Should examples show error handling?

**Suggested improvements:**
- Provide JSDoc template:
  ```typescript
  /**
   * Brief description of what the function does
   * @param paramName - Description of parameter
   * @returns Promise resolving to description of return value
   * @throws Error description if applicable
   * @example
   * const result = await functionName(param);
   * console.log(result);
   */
  ```
- Specify required tags: "@param for each parameter, @returns for return type, @example for usage"

### 8. serde_json::Value Type Mapping
**Issue:** The `get_project_registry` command returns `serde_json::Value` in Rust, but the task doesn't specify the TypeScript equivalent.

**What was unclear:**
- What TypeScript type should represent `serde_json::Value`?
- Should it be `any`, `Record<string, any>`, or a specific interface?
- How to type JSON values safely?

**Suggested improvements:**
- Specify: "For Rust `serde_json::Value`, use `Record<string, any>` in TypeScript for object values, or `any` if the structure is completely unknown"
- Show example:
  ```typescript
  export async function invokeGetProjectRegistry(): Promise<Record<string, any>> {
    return invoke<Record<string, any>>('get_project_registry');
  }
  ```

### 9. Void Return Type Handling
**Issue:** Commands that return `Result<(), String>` in Rust need special handling in TypeScript.

**What was unclear:**
- Should TypeScript functions return `Promise<void>`?
- How to handle the void return type in invoke?

**Suggested improvements:**
- Show pattern:
  ```typescript
  export async function invokeWatchProjectKits(projectPath: string): Promise<void> {
    return invoke<void>('watch_project_kits', { project_path: projectPath });
  }
  ```
- Explain: "Rust `Result<(), String>` maps to TypeScript `Promise<void>`"

### 10. Command Name Mapping
**Issue:** Rust command names use snake_case (e.g., `get_project_kits`), but the task doesn't explicitly show this mapping.

**What was unclear:**
- Should TypeScript function names match Rust command names?
- What naming convention for TypeScript functions?
- How to ensure the invoke call uses the correct Rust command name?

**Suggested improvements:**
- Specify naming convention:
  - TypeScript functions: `invoke[CommandName]()` in camelCase
  - Rust command names: snake_case in invoke call
  - Example: `invokeGetProjectKits()` calls `'get_project_kits'`
- Provide mapping table or pattern

### 11. Type Safety Verification
**Issue:** The task doesn't explain how to verify that types match between Rust and TypeScript.

**What was unclear:**
- How to ensure types stay in sync?
- Should we test IPC calls to verify types?
- What happens if types don't match?

**Suggested improvements:**
- Add verification step: "Test each IPC function to ensure types match:
  ```typescript
  // This should compile and work at runtime
  const info: AppInfo = await invokeGetAppInfo();
  console.log(info.version, info.platform);
  ```"
- Note: "Type mismatches will cause runtime errors. Test IPC calls during development."

### 12. Missing Command Documentation
**Issue:** Some commands in the Rust backend might not be listed in the task, or the task might list commands that don't exist.

**What was unclear:**
- Should we create wrappers for all Rust commands or only listed ones?
- How to verify we haven't missed any commands?
- What if a command signature changes?

**Suggested improvements:**
- Add step: "Review `src-tauri/src/commands.rs` to verify all `#[tauri::command]` functions have corresponding TypeScript wrappers"
- Or provide a checklist of all commands to implement

### 13. Import Statement Pattern
**Issue:** The task doesn't show the import statement needed for the invoke function.

**What was unclear:**
- Which package to import from?
- Is it `@tauri-apps/api` or `@tauri-apps/api/tauri`?
- What's the exact import syntax?

**Suggested improvements:**
- Show import at top of file:
  ```typescript
  import { invoke } from '@tauri-apps/api/tauri';
  ```
- Note: "For Tauri v1.5, use `@tauri-apps/api/tauri`. For v2, the import path differs."

### 14. Export Pattern
**Issue:** The task says to export all functions but doesn't show the export pattern.

**What was unclear:**
- Should all functions be named exports?
- Should types be exported too?
- Should there be a default export?

**Suggested improvements:**
- Specify: "Use named exports for all functions and types:
  ```typescript
  export interface AppInfo { ... }
  export async function invokePing() { ... }
  ```"
- Or show: "Export everything that components will need to import"

### 15. Type Definitions Location
**Issue:** The task says to create types in `src/ipc.ts` but doesn't clarify if types should be in the same file or separate.

**What was unclear:**
- Should all types be in one file?
- Should types be exported for use in other files?
- Should there be a separate `src/types/ipc.ts` file?

**Suggested improvements:**
- Clarify: "All types and functions can be in `src/ipc.ts` for simplicity, or split into `src/types/ipc.ts` and `src/ipc.ts` if the file gets too large"
- Or specify: "Keep everything in one file for this layer. Refactor later if needed."

## Additional Suggestions

### 16. Type Reusability
**Suggestion:** Note that some types (like `AppInfo`) might be used in multiple places, so they should be exported for reuse.

### 17. Future Type Extensions
**Suggestion:** Mention that types can be extended later as the application grows, and it's okay to start with basic types.

### 18. Testing IPC Functions
**Suggestion:** Add a note about testing IPC functions in a React component to verify they work:
```typescript
// In a component
useEffect(() => {
  invokePing().then(console.log).catch(console.error);
}, []);
```

### 19. Error Message Format
**Suggestion:** Note that Rust commands return error messages as strings, which will be the rejection message in TypeScript promises.

### 20. Async/Await Pattern
**Suggestion:** Show that all IPC functions are async and should be called with await or .then().

## Summary
The main themes for improvement are:
1. **Type mapping clarity** - Better explanation of Rust → TypeScript type mappings
2. **Parameter naming** - Explicit guidance on snake_case to camelCase conversion
3. **Command name mapping** - Clear pattern for matching Rust command names
4. **Error handling** - Documentation of how errors are handled
5. **Type definitions scope** - Which types are required vs optional vs future use
6. **Verification steps** - How to test that types match correctly

These improvements would make the IPC system implementation much more straightforward and reduce guesswork about type mappings and naming conventions.

