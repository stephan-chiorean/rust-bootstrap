import { Box, Text } from '@chakra-ui/react';

interface MermaidDiagramViewerProps {
  content: string;
}

export function MermaidDiagramViewer({ content }: MermaidDiagramViewerProps) {
  // Mermaid rendering would be implemented here
  // For now, just display the content
  return (
    <Box p={4} bg="bg.main" borderRadius="md">
      <Text as="pre" whiteSpace="pre-wrap" color="text.primary" fontFamily="mono">
        {content}
      </Text>
    </Box>
  );
}

