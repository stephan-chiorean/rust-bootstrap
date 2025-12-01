import { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Spinner } from '@chakra-ui/react';
import { invokeGetScrapbookItems } from '../../ipc';
import { useWorkstation } from '../../contexts/WorkstationContext';

export function ScrapbookTabContent() {
  const { currentWorkstation } = useWorkstation();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!currentWorkstation?.path) return;

    try {
      setLoading(true);
      setError(null);
      const itemList = await invokeGetScrapbookItems(currentWorkstation.path);
      setItems(itemList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scrapbook items');
      console.error('Failed to load scrapbook items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
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
        <Button mt={4} onClick={loadItems}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading size="lg" mb={4} color="text.primary">
        Scrapbook
      </Heading>
      <VStack gap={2} align="stretch">
        {items.length === 0 ? (
          <Text color="text.secondary">No scrapbook items found in this project.</Text>
        ) : (
          items.map((item, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.header"
            >
              <Text color="text.primary">{item}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}

