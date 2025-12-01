import { Box, VStack, Button } from '@chakra-ui/react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: string;
  onNavigate: (view: string) => void;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  currentView,
  onNavigate,
}: NavigationDrawerProps) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'kits', label: 'Kits' },
    { id: 'blueprints', label: 'Blueprints' },
    { id: 'walkthroughs', label: 'Walkthroughs' },
    { id: 'agents', label: 'Agents' },
    { id: 'diagrams', label: 'Diagrams' },
    { id: 'scrapbook', label: 'Scrapbook' },
  ];

  return (
    <Box
      as="nav"
      w="250px"
      h="100vh"
      bg="bg.header"
      borderRightWidth="1px"
      p={4}
      position="fixed"
      left={0}
      top={0}
      zIndex={1000}
    >
      <VStack gap={2} align="stretch">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'solid' : 'ghost'}
            justifyContent="flex-start"
            onClick={() => {
              onNavigate(item.id);
              onClose();
            }}
          >
            {item.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
}

