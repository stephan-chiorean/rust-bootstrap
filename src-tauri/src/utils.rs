use std::path::PathBuf;

/// Format a message with platform information
pub fn format_message(message: &str) -> String {
    let platform = get_platform();
    format!("[{}] {}", platform, message)
}

/// Get the current platform name
pub fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

/// Get the home directory path
pub fn get_home_dir() -> Result<PathBuf, String> {
    dirs::home_dir().ok_or_else(|| "Could not find home directory".to_string())
}

/// Get the app data directory
pub fn get_app_data_dir() -> Result<PathBuf, String> {
    dirs::data_dir().ok_or_else(|| "Could not find app data directory".to_string())
}

