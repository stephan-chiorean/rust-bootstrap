import { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spinner } from '@chakra-ui/react';
import { invokeGetBlueprints } from '../../ipc';
import { useWorkstation } from '../../contexts/WorkstationContext';

export function BlueprintsTabContent() {
  const { currentWorkstation } = useWorkstation();
  const [blueprints, setBlueprints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlueprints = async () => {
    if (!currentWorkstation?.path) return;

    try {
      setLoading(true);
      setError(null);
      const blueprintList = await invokeGetBlueprints(currentWorkstation.path);
      setBlueprints(blueprintList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blueprints');
      console.error('Failed to load blueprints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlueprints();
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
        <Button mt={4} onClick={loadBlueprints}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={4} color="text.primary">
        Blueprints
      </Heading>
      <VStack gap={2} align="stretch">
        {blueprints.length === 0 ? (
          <Text color="text.secondary">No blueprints found in this project.</Text>
        ) : (
          blueprints.map((blueprint, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.header"
            >
              <Text color="text.primary">{blueprint}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}

