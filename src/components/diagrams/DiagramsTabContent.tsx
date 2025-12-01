import { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spinner } from '@chakra-ui/react';
import { invokeGetProjectDiagrams } from '../../ipc';
import { useWorkstation } from '../../contexts/WorkstationContext';

export function DiagramsTabContent() {
  const { currentWorkstation } = useWorkstation();
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiagrams = async () => {
    if (!currentWorkstation?.path) return;

    try {
      setLoading(true);
      setError(null);
      const diagramList = await invokeGetProjectDiagrams(currentWorkstation.path);
      setDiagrams(diagramList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagrams');
      console.error('Failed to load diagrams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagrams();
  }, [currentWorkstation?.path]);

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error: {error}</Text>
        <Button mt={4} onClick={loadDiagrams}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={4} color="text.primary">
        Diagrams
      </Heading>
      <VStack gap={2} align="stretch">
        {diagrams.length === 0 ? (
          <Text color="text.secondary">No diagrams found in this project.</Text>
        ) : (
          diagrams.map((diagram, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.header"
            >
              <Text color="text.primary">{diagram}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}

