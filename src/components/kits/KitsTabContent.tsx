import { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spinner } from '@chakra-ui/react';
import { invokeGetProjectKits } from '../../ipc';
import { useProjectKitWatcher } from '../../hooks/useFileWatcher';
import { useWorkstation } from '../../contexts/WorkstationContext';

export function KitsTabContent() {
  const { currentWorkstation } = useWorkstation();
  const [kits, setKits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKits = async () => {
    if (!currentWorkstation?.path) return;

    try {
      setLoading(true);
      setError(null);
      const kitList = await invokeGetProjectKits(currentWorkstation.path);
      setKits(kitList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kits');
      console.error('Failed to load kits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKits();
  }, [currentWorkstation?.path]);

  // Watch for kit changes
  useProjectKitWatcher(
    currentWorkstation?.path || null,
    () => {
      loadKits();
    }
  );

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
        <Button mt={4} onClick={loadKits}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={4} color="text.primary">
        Kits
      </Heading>
      <VStack gap={2} align="stretch">
        {kits.length === 0 ? (
          <Text color="text.secondary">No kits found in this project.</Text>
        ) : (
          kits.map((kit, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.header"
            >
              <Text color="text.primary">{kit}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}

