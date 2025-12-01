use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::mpsc;
use tauri::{AppHandle, Manager};

/// Watch a single file for changes and emit Tauri events
pub fn watch_file(
    app_handle: AppHandle,
    file_path: PathBuf,
    event_name: String,
) -> Result<(), String> {
    let file_path_clone = file_path.clone();
    
    // Create a channel to receive file events
    let (tx, rx) = mpsc::channel();
    
    // Create a watcher
    let mut watcher = RecommendedWatcher::new(
        move |result: Result<Event, notify::Error>| {
            if let Ok(event) = result {
                if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_)) {
                    if let Err(e) = tx.send(event) {
                        eprintln!("Error sending file event: {}", e);
                    }
                }
            }
        },
        Config::default(),
    )
    .map_err(|e| format!("Failed to create file watcher: {}", e))?;

    // Watch the file
    watcher
        .watch(&file_path, RecursiveMode::NonRecursive)
        .map_err(|e| format!("Failed to watch file: {:?}: {}", file_path, e))?;

    // Spawn a task to handle events
    let app_handle_clone = app_handle.clone();
    tokio::spawn(async move {
        while let Ok(event) = rx.recv() {
            if let Some(path) = event.paths.first() {
                if path == &file_path_clone {
                    if let Err(e) = app_handle_clone.emit_all(&event_name, ()) {
                        eprintln!("Failed to emit event {}: {}", event_name, e);
                    }
                }
            }
        }
    });

    Ok(())
}

/// Watch a directory recursively for .md file changes
pub fn watch_directory(
    app_handle: AppHandle,
    dir_path: PathBuf,
    event_name: String,
) -> Result<(), String> {
    
    // Create a channel to receive file events
    let (tx, rx) = mpsc::channel();
    
    // Create a watcher
    let mut watcher = RecommendedWatcher::new(
        move |result: Result<Event, notify::Error>| {
            if let Ok(event) = result {
                if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_)) {
                    // Filter for .md files only
                    let has_md_file = event.paths.iter().any(|p| {
                        p.extension()
                            .and_then(|ext| ext.to_str())
                            .map(|ext| ext == "md")
                            .unwrap_or(false)
                    });
                    
                    if has_md_file {
                        if let Err(e) = tx.send(event) {
                            eprintln!("Error sending directory event: {}", e);
                        }
                    }
                }
            }
        },
        Config::default(),
    )
    .map_err(|e| format!("Failed to create directory watcher: {}", e))?;

    // Watch the directory recursively
    watcher
        .watch(&dir_path, RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch directory: {:?}: {}", dir_path, e))?;

    // Spawn a task to handle events
    let app_handle_clone = app_handle.clone();
    tokio::spawn(async move {
        while let Ok(event) = rx.recv() {
            let md_files: Vec<String> = event
                .paths
                .iter()
                .filter_map(|p| {
                    if p.extension()
                        .and_then(|ext| ext.to_str())
                        .map(|ext| ext == "md")
                        .unwrap_or(false)
                    {
                        p.to_str().map(|s| s.to_string())
                    } else {
                        None
                    }
                })
                .collect();
            
            if !md_files.is_empty() {
                if let Err(e) = app_handle_clone.emit_all(&event_name, md_files) {
                    eprintln!("Failed to emit event {}: {}", event_name, e);
                }
            }
        }
    });

    Ok(())
}

/// Get path to project registry file
pub fn get_registry_path() -> Result<PathBuf, String> {
    let home_dir = crate::utils::get_home_dir()?;
    Ok(home_dir.join(".bluekit").join("projectRegistry.json"))
}

