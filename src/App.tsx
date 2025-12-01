import { useState, useEffect } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { ColorModeProvider, useColorMode } from './contexts/ColorModeContext';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { WorkstationProvider, useWorkstation } from './contexts/WorkstationContext';
import { SelectionProvider } from './contexts/SelectionContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomePage } from './pages/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { Header } from './components/Header';
import { useRegistryWatcher } from './hooks/useFileWatcher';

type View = 'welcome' | 'home' | 'project-detail';

function AppContent() {
  const [view, setView] = useState<View>('welcome');
  const { colorMode } = useColorMode();
  const { currentWorkstation, setCurrentWorkstation } = useWorkstation();

  // Watch for registry changes
  useRegistryWatcher(() => {
    // Reload projects when registry changes
    if (view === 'home') {
      // Trigger a re-render or reload
      console.log('Registry changed, reloading projects...');
    }
  });

  // Navigate to project detail when workstation is selected
  useEffect(() => {
    if (currentWorkstation && currentWorkstation.path && view === 'home') {
      setView('project-detail');
    }
  }, [currentWorkstation, view]);

  const handleNavigateHome = () => {
    setCurrentWorkstation(null);
    setView('home');
  };

  const handleGetStarted = () => {
    setView('home');
  };

  // Render different views based on state
  const renderView = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      case 'home':
        return <HomePage />;
      case 'project-detail':
        if (!currentWorkstation) {
          return (
            <Box p={8}>
              <p>No project selected</p>
              <Button onClick={handleNavigateHome}>Go to Home</Button>
            </Box>
          );
        }
        return (
          <>
            <Header onNavigateHome={handleNavigateHome} />
            <ProjectDetailPage />
          </>
        );
      default:
        return <Box p={8}>Unknown view</Box>;
    }
  };


  return (
    <Box
      minH="100vh"
      bg="bg.main"
      color="text.fg"
      data-theme={colorMode}
    >
      {renderView()}
    </Box>
  );
}

function App() {
  return (
    <ColorModeProvider>
      <FeatureFlagsProvider>
        <WorkstationProvider>
          <SelectionProvider>
            <AppContent />
          </SelectionProvider>
        </WorkstationProvider>
      </FeatureFlagsProvider>
    </ColorModeProvider>
  );
}

export default App;
