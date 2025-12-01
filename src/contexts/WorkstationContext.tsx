import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Workstation {
  id: string;
  name: string;
  path: string;
}

interface WorkstationContextType {
  currentWorkstation: Workstation | null;
  setCurrentWorkstation: (workstation: Workstation | null) => void;
  workstations: Workstation[];
  addWorkstation: (workstation: Workstation) => void;
  removeWorkstation: (id: string) => void;
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export function WorkstationProvider({ children }: { children: ReactNode }) {
  const [currentWorkstation, setCurrentWorkstation] = useState<Workstation | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('current-workstation');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [workstations, setWorkstations] = useState<Workstation[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('workstations');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentWorkstation) {
        localStorage.setItem('current-workstation', JSON.stringify(currentWorkstation));
      } else {
        localStorage.removeItem('current-workstation');
      }
    }
  }, [currentWorkstation]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workstations', JSON.stringify(workstations));
    }
  }, [workstations]);

  const addWorkstation = (workstation: Workstation) => {
    setWorkstations((prev) => {
      if (prev.some((w) => w.id === workstation.id)) {
        return prev;
      }
      return [...prev, workstation];
    });
  };

  const removeWorkstation = (id: string) => {
    setWorkstations((prev) => prev.filter((w) => w.id !== id));
    if (currentWorkstation?.id === id) {
      setCurrentWorkstation(null);
    }
  };

  return (
    <WorkstationContext.Provider
      value={{
        currentWorkstation,
        setCurrentWorkstation,
        workstations,
        addWorkstation,
        removeWorkstation,
      }}
    >
      {children}
    </WorkstationContext.Provider>
  );
}

export function useWorkstation() {
  const context = useContext(WorkstationContext);
  if (context === undefined) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
}

