# Improvements for project-setup.md Task Instructions

## Overview
This document outlines areas where the `project-setup.md` task instructions could be clearer based on the actual implementation experience.

## Key Issues Encountered

### 1. Tauri Version Mismatch
**Issue:** The task specifies Tauri v1.5, but `npm create tauri-app@latest` creates a Tauri v2 project by default.

**What was unclear:**
- No warning that the generated project structure will differ from v1.5
- No guidance on how to handle the version mismatch
- The generated files use v2 syntax/APIs that need to be converted

**Suggested improvements:**
- Add a note: "Note: `npm create tauri-app@latest` may create a v2 project. You'll need to downgrade dependencies and update configuration files to match v1.5 specifications."
- Or provide alternative: "Alternatively, use `npm create tauri-app@1.5` if available, or manually create the project structure."

### 2. Project Name Handling
**Issue:** The `npm create tauri-app` command with flags created a directory literally named `--name` instead of using the project name.

**What was unclear:**
- The command syntax example doesn't show how to properly pass the project name
- No mention that files may need to be moved from a subdirectory
- The generated files contain placeholder names that need manual replacement

**Suggested improvements:**
- Clarify the exact command syntax: `npm create tauri-app@latest` (interactive) or provide the correct non-interactive flags
- Add step: "After project creation, verify the project name in all files and update if needed"
- Mention: "If files are created in a subdirectory, move them to the project root"

### 3. Cargo.toml Library Configuration
**Issue:** The task's Cargo.toml example doesn't include the `[lib]` section, but the generated project structure requires it for the lib.rs pattern.

**What was unclear:**
- The example Cargo.toml is missing the `[lib]` section that defines the library crate
- No mention that main.rs needs to reference the lib name
- The relationship between lib.rs and main.rs isn't explained

**Suggested improvements:**
- Add the `[lib]` section to the Cargo.toml example:
  ```toml
  [lib]
  name = "rust_bootstrap_lib"
  crate-type = ["staticlib", "cdylib", "rlib"]
  ```
- Add a note explaining the lib/main.rs pattern
- Include instructions to update main.rs to call the lib's run function

### 4. Rust Source Files Structure
**Issue:** The generated lib.rs uses Tauri v2 syntax (plugins, mobile entry points) that needs to be updated for v1.5.

**What was unclear:**
- No mention that lib.rs needs to be updated to remove v2-specific code
- The example doesn't show what lib.rs should look like for v1.5
- main.rs needs to be updated to reference the correct lib name

**Suggested improvements:**
- Provide example lib.rs content for v1.5:
  ```rust
  #[tauri::command]
  fn greet(name: &str) -> String {
      format!("Hello, {}! You've been greeted from Rust!", name)
  }

  pub fn run() {
      tauri::Builder::default()
          .invoke_handler(tauri::generate_handler![greet])
          .run(tauri::generate_context!())
          .expect("error while running tauri application");
  }
  ```
- Show main.rs should call: `rust_bootstrap_lib::run()`
- Note: Remove any plugin initialization code from v2

### 5. Frontend API Import Paths
**Issue:** The generated App.tsx uses Tauri v2 import paths (`@tauri-apps/api/core`) that don't work with v1.5.

**What was unclear:**
- No mention that frontend files need API import updates
- The task doesn't specify what the correct import path should be for v1.5

**Suggested improvements:**
- Add a step: "Update frontend imports to use Tauri v1.5 API paths"
- Specify: "Change `@tauri-apps/api/core` to `@tauri-apps/api/tauri`"
- Or provide the correct App.tsx import example

### 6. tauri.conf.json Structure Differences
**Issue:** The generated tauri.conf.json uses v2 structure which is significantly different from v1.5.

**What was unclear:**
- The v2 config uses different top-level keys (`app`, `build` structure differs)
- No warning that the entire config structure needs to be replaced
- The v1.5 format uses nested `tauri` object which isn't obvious

**Suggested improvements:**
- Add a clear note: "The generated tauri.conf.json uses Tauri v2 format. Replace it entirely with the v1.5 format shown below."
- Emphasize that the structure is fundamentally different, not just version numbers

### 7. Verification Steps
**Issue:** The verification steps don't catch the API import issues until the build step.

**What was unclear:**
- TypeScript checking isn't mentioned in verification
- The build step is the last verification, so errors are discovered late

**Suggested improvements:**
- Add `tsc --noEmit` as a verification step before the full build
- Reorder verification: TypeScript check → Rust check → Full build
- Add a note: "If TypeScript errors appear, check that all Tauri API imports use v1.5 paths"

### 8. Missing Context on Project Structure
**Issue:** The task assumes familiarity with Tauri project structure but doesn't explain the lib.rs/main.rs pattern.

**What was unclear:**
- Why there are both lib.rs and main.rs files
- How they relate to each other
- What the lib name should match

**Suggested improvements:**
- Add a brief explanation: "Tauri projects use a library crate pattern where lib.rs contains the application logic and main.rs is a thin wrapper that calls the library."
- Explain the naming convention: "The lib name in Cargo.toml should match your project name with underscores"

## Additional Suggestions

### 9. Dependency Version Clarification
**Suggestion:** The task shows specific versions (e.g., `^1.5.0`), but npm may install newer patch versions. This is fine, but could be noted.

### 10. Error Recovery Guidance
**Suggestion:** Add a troubleshooting section for common issues:
- "If cargo check fails, ensure Rust toolchain is up to date: `rustup update`"
- "If npm install fails, try clearing cache: `npm cache clean --force`"
- "If TypeScript errors about missing modules, verify package.json dependencies match exactly"

### 11. Step Dependencies
**Suggestion:** Make it clearer that some steps must be done in order:
- Cargo.toml must be updated before `cargo check`
- package.json must be updated before `npm install`
- All configs must be updated before `npm run build`

## Summary
The main theme is that the task doesn't adequately address the version mismatch between what `npm create tauri-app@latest` generates (v2) and what the task specifies (v1.5). More explicit guidance on:
1. Handling the version downgrade
2. Updating generated files to match v1.5 patterns
3. The complete file structure and relationships
4. Verification order and TypeScript checking

would make the task much clearer and reduce implementation friction.

