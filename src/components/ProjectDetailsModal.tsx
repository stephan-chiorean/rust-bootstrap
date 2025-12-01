import { Box, Heading, Text, Button } from '@chakra-ui/react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  projectPath?: string;
}

export function ProjectDetailsModal({
  isOpen,
  onClose,
  projectName,
  projectPath,
}: ProjectDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="bg.main"
        p={6}
        borderRadius="md"
        maxW="500px"
        w="90%"
        onClick={(e) => e.stopPropagation()}
      >
        <Heading size="md" mb={4} color="text.primary">
          Project Details
        </Heading>
        <Text mb={2} color="text.primary">
          <strong>Name:</strong> {projectName || 'Unnamed Project'}
        </Text>
        <Text mb={4} color="text.primary">
          <strong>Path:</strong> {projectPath || 'No path'}
        </Text>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
}

