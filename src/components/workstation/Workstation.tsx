import { Box, Heading, Text } from '@chakra-ui/react';
import { useWorkstation } from '../../contexts/WorkstationContext';

export function Workstation() {
  const { currentWorkstation } = useWorkstation();

  if (!currentWorkstation) {
    return (
      <Box p={8}>
        <Text color="text.secondary">No workstation selected.</Text>
      </Box>
    );
  }

  return (
    <Box p={8} bg="bg.main" minH="100vh">
      <Heading size="xl" mb={4} color="text.primary">
        {currentWorkstation.name}
      </Heading>
      <Text color="text.secondary">Path: {currentWorkstation.path}</Text>
    </Box>
  );
}

