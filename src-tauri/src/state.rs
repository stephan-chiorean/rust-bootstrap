use serde::{Deserialize, Serialize};

/// Application state structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub version: String,
    pub platform: String,
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            version: env!("CARGO_PKG_VERSION").to_string(),
            platform: std::env::consts::OS.to_string(),
        }
    }
}

