import { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isEnabled: (flag: string) => boolean;
  setFlag: (flag: string, enabled: boolean) => void;
  toggleFlag: (flag: string) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const defaultFlags: FeatureFlags = {
  // Add default feature flags here
  enableAdvancedFeatures: false,
  enableExperimentalUI: false,
};

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('feature-flags');
      if (stored) {
        try {
          return { ...defaultFlags, ...JSON.parse(stored) };
        } catch {
          return defaultFlags;
        }
      }
    }
    return defaultFlags;
  });

  const isEnabled = (flag: string): boolean => {
    return flags[flag] ?? false;
  };

  const setFlag = (flag: string, enabled: boolean) => {
    setFlags((prev) => {
      const updated = { ...prev, [flag]: enabled };
      if (typeof window !== 'undefined') {
        localStorage.setItem('feature-flags', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const toggleFlag = (flag: string) => {
    setFlag(flag, !isEnabled(flag));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled, setFlag, toggleFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

