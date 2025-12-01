import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Button, Text, Spinner } from '@chakra-ui/react';
import { invokeGetProjectRegistry } from '../ipc';
import { useWorkstation } from '../contexts/WorkstationContext';

export function HomePage() {
  const [projects, setProjects] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentWorkstation } = useWorkstation();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const registry = await invokeGetProjectRegistry();
      setProjects(registry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectPath: string, projectName: string) => {
    setCurrentWorkstation({
      id: projectPath,
      name: projectName,
      path: projectPath,
    });
  };

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error: {error}</Text>
        <Button mt={4} onClick={loadProjects}>
          Retry
        </Button>
      </Box>
    );
  }

  const projectEntries = Object.values(projects) as Array<{ name?: string; path?: string }>;

  return (
    <Box p={8} bg="bg.main" minH="100vh">
      <Heading size="xl" mb={6} color="text.primary">
        Projects
      </Heading>
      <VStack gap={4} align="stretch">
        {projectEntries.length === 0 ? (
          <Text color="text.secondary">No projects found. Create a new project to get started.</Text>
        ) : (
          projectEntries.map((project, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.header"
              _hover={{ bg: 'bg.subtle' }}
            >
              <Heading size="md" mb={2} color="text.primary">
                {project.name || 'Unnamed Project'}
              </Heading>
              <Text fontSize="sm" color="text.secondary" mb={4}>
                {project.path || 'No path'}
              </Text>
              <Button
                size="sm"
                onClick={() => handleSelectProject(project.path || '', project.name || 'Project')}
              >
                Open Project
              </Button>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}

