import { Box, Text } from '@chakra-ui/react';

interface KitMarkdownViewerProps {
  content: string;
}

export function KitMarkdownViewer({ content }: KitMarkdownViewerProps) {
  return (
    <Box p={4} bg="bg.main" borderRadius="md">
      <Text as="pre" whiteSpace="pre-wrap" color="text.primary" fontFamily="mono">
        {content}
      </Text>
    </Box>
  );
}

