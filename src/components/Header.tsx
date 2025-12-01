import { Box, Heading, Button, HStack } from '@chakra-ui/react';
import { useColorMode } from '../contexts/ColorModeContext';
import { useWorkstation } from '../contexts/WorkstationContext';

interface HeaderProps {
  onNavigateHome?: () => void;
}

export function Header({ onNavigateHome }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentWorkstation } = useWorkstation();

  return (
    <Box
      as="header"
      bg="bg.header"
      borderBottomWidth="1px"
      px={6}
      py={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <HStack gap={4}>
        {onNavigateHome && (
          <Button variant="ghost" size="sm" onClick={onNavigateHome}>
            Home
          </Button>
        )}
        <Heading size="md" color="text.primary">
          {currentWorkstation?.name || 'Rust Bootstrap'}
        </Heading>
      </HStack>
      <HStack gap={2}>
        <Button size="sm" variant="ghost" onClick={toggleColorMode}>
          {colorMode === 'light' ? '🌙' : '☀️'}
        </Button>
      </HStack>
    </Box>
  );
}

