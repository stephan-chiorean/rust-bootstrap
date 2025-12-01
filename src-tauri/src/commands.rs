use crate::state::AppState;
use crate::utils;
use crate::watcher;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;

/// Basic ping command to test IPC communication
#[tauri::command]
pub fn ping() -> Result<String, String> {
    Ok("pong".to_string())
}

/// Get application information
#[tauri::command]
pub fn get_app_info() -> Result<AppState, String> {
    Ok(AppState::default())
}

/// Example error command to demonstrate error handling
#[tauri::command]
pub fn example_error(should_error: bool) -> Result<String, String> {
    if should_error {
        Err("This is an example error".to_string())
    } else {
        Ok("No error occurred".to_string())
    }
}

/// Read a file and return its contents as a string
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let path_buf = PathBuf::from(&path);
    
    if !path_buf.exists() {
        return Err(format!("File does not exist: {}", path));
    }
    
    if !path_buf.is_file() {
        return Err(format!("Path is not a file: {}", path));
    }
    
    fs::read_to_string(&path_buf)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}

/// Get all kit files from the project's .bluekit/kits directory
#[tauri::command]
pub fn get_project_kits(project_path: String) -> Result<Vec<String>, String> {
    let kits_dir = PathBuf::from(&project_path).join(".bluekit").join("kits");
    
    if !kits_dir.exists() {
        return Ok(Vec::new());
    }
    
    let entries = fs::read_dir(&kits_dir)
        .map_err(|e| format!("Failed to read kits directory: {}", e))?;
    
    let mut kits = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                kits.push(file_name.to_string());
            }
        }
    }
    
    Ok(kits)
}

/// Get project registry from ~/.bluekit/projectRegistry.json
#[tauri::command]
pub fn get_project_registry() -> Result<serde_json::Value, String> {
    let registry_path = watcher::get_registry_path()?;
    
    if !registry_path.exists() {
        return Ok(serde_json::json!({}));
    }
    
    let content = fs::read_to_string(&registry_path)
        .map_err(|e| format!("Failed to read registry file: {}", e))?;
    
    let registry: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse registry JSON: {}", e))?;
    
    Ok(registry)
}

/// Watch project kits directory for changes
#[tauri::command]
pub fn watch_project_kits(
    app_handle: AppHandle,
    project_path: String,
) -> Result<(), String> {
    let kits_dir = PathBuf::from(&project_path).join(".bluekit").join("kits");
    
    if !kits_dir.exists() {
        return Err(format!("Kits directory does not exist: {:?}", kits_dir));
    }
    
    watcher::watch_directory(
        app_handle,
        kits_dir,
        "project-kits-changed".to_string(),
    )
}

/// Copy a kit file from global store to project
#[tauri::command]
pub fn copy_kit_to_project(
    kit_name: String,
    project_path: String,
) -> Result<String, String> {
    let home_dir = utils::get_home_dir()?;
    let global_kit_path = home_dir
        .join(".bluekit")
        .join("kits")
        .join(&kit_name);
    
    let project_kit_path = PathBuf::from(&project_path)
        .join(".bluekit")
        .join("kits")
        .join(&kit_name);
    
    // Create project .bluekit/kits directory if it doesn't exist
    if let Some(parent) = project_kit_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create kits directory: {}", e))?;
    }
    
    if !global_kit_path.exists() {
        return Err(format!("Kit not found in global store: {}", kit_name));
    }
    
    fs::copy(&global_kit_path, &project_kit_path)
        .map_err(|e| format!("Failed to copy kit: {}", e))?;
    
    Ok(format!("Kit {} copied to project", kit_name))
}

/// Copy a blueprint to project
#[tauri::command]
pub fn copy_blueprint_to_project(
    blueprint_id: String,
    project_path: String,
) -> Result<String, String> {
    let home_dir = utils::get_home_dir()?;
    let global_blueprint_dir = home_dir
        .join(".bluekit")
        .join("blueprints")
        .join(&blueprint_id);
    
    let project_blueprint_dir = PathBuf::from(&project_path)
        .join(".bluekit")
        .join("blueprints")
        .join(&blueprint_id);
    
    if !global_blueprint_dir.exists() {
        return Err(format!("Blueprint not found: {}", blueprint_id));
    }
    
    // Create project blueprint directory
    fs::create_dir_all(&project_blueprint_dir)
        .map_err(|e| format!("Failed to create blueprint directory: {}", e))?;
    
    // Copy all files from global blueprint to project
    copy_directory_recursive(&global_blueprint_dir, &project_blueprint_dir)?;
    
    Ok(format!("Blueprint {} copied to project", blueprint_id))
}

/// Helper function to copy directory recursively
fn copy_directory_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    if !src.is_dir() {
        return Err("Source is not a directory".to_string());
    }
    
    fs::create_dir_all(dst)
        .map_err(|e| format!("Failed to create destination directory: {}", e))?;
    
    let entries = fs::read_dir(src)
        .map_err(|e| format!("Failed to read source directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        let file_name = path.file_name().ok_or("Invalid file name")?;
        let dst_path = dst.join(file_name);
        
        if path.is_dir() {
            copy_directory_recursive(&path, &dst_path)?;
        } else {
            fs::copy(&path, &dst_path)
                .map_err(|e| format!("Failed to copy file {:?}: {}", path, e))?;
        }
    }
    
    Ok(())
}

/// Get scrapbook items from project
#[tauri::command]
pub fn get_scrapbook_items(project_path: String) -> Result<Vec<String>, String> {
    let scrapbook_dir = PathBuf::from(&project_path).join(".bluekit").join("scrapbook");
    
    if !scrapbook_dir.exists() {
        return Ok(Vec::new());
    }
    
    let entries = fs::read_dir(&scrapbook_dir)
        .map_err(|e| format!("Failed to read scrapbook directory: {}", e))?;
    
    let mut items = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                items.push(file_name.to_string());
            }
        }
    }
    
    Ok(items)
}

/// Get all markdown files from a folder
#[tauri::command]
pub fn get_folder_markdown_files(folder_path: String) -> Result<Vec<String>, String> {
    let folder = PathBuf::from(&folder_path);
    
    if !folder.exists() {
        return Err(format!("Folder does not exist: {}", folder_path));
    }
    
    if !folder.is_dir() {
        return Err(format!("Path is not a directory: {}", folder_path));
    }
    
    let entries = fs::read_dir(&folder)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut md_files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if ext == "md" {
                    if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                        md_files.push(file_name.to_string());
                    }
                }
            }
        }
    }
    
    Ok(md_files)
}

/// Get all blueprints from project
#[tauri::command]
pub fn get_blueprints(project_path: String) -> Result<Vec<String>, String> {
    let blueprints_dir = PathBuf::from(&project_path)
        .join(".bluekit")
        .join("blueprints");
    
    if !blueprints_dir.exists() {
        return Ok(Vec::new());
    }
    
    let entries = fs::read_dir(&blueprints_dir)
        .map_err(|e| format!("Failed to read blueprints directory: {}", e))?;
    
    let mut blueprints = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_dir() {
            if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
                blueprints.push(dir_name.to_string());
            }
        }
    }
    
    Ok(blueprints)
}

/// Get a specific blueprint task file
#[tauri::command]
pub fn get_blueprint_task_file(
    project_path: String,
    blueprint_id: String,
    task_file: String,
) -> Result<String, String> {
    let task_path = PathBuf::from(&project_path)
        .join(".bluekit")
        .join("blueprints")
        .join(&blueprint_id)
        .join(&task_file);
    
    if !task_path.exists() {
        return Err(format!("Task file does not exist: {:?}", task_path));
    }
    
    read_file(task_path.to_str().unwrap().to_string())
}

/// Get all diagram files from project
#[tauri::command]
pub fn get_project_diagrams(project_path: String) -> Result<Vec<String>, String> {
    let diagrams_dir = PathBuf::from(&project_path)
        .join(".bluekit")
        .join("diagrams");
    
    if !diagrams_dir.exists() {
        return Ok(Vec::new());
    }
    
    let entries = fs::read_dir(&diagrams_dir)
        .map_err(|e| format!("Failed to read diagrams directory: {}", e))?;
    
    let mut diagrams = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                diagrams.push(file_name.to_string());
            }
        }
    }
    
    Ok(diagrams)
}

