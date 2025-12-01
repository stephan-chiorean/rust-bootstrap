mod commands;
mod state;
mod utils;
mod watcher;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::ping,
            commands::get_app_info,
            commands::example_error,
            commands::get_project_kits,
            commands::get_project_registry,
            commands::watch_project_kits,
            commands::read_file,
            commands::copy_kit_to_project,
            commands::copy_blueprint_to_project,
            commands::get_scrapbook_items,
            commands::get_folder_markdown_files,
            commands::get_blueprints,
            commands::get_blueprint_task_file,
            commands::get_project_diagrams,
        ])
        .setup(|app| {
            let app_handle = app.handle();
            if let Ok(registry_path) = watcher::get_registry_path() {
                if let Err(e) = watcher::watch_file(
                    app_handle.clone(),
                    registry_path,
                    "project-registry-changed".to_string(),
                ) {
                    eprintln!("Failed to start file watcher: {}", e);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
