import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.main"
      p={8}
    >
      <VStack gap={6} maxW="600px" textAlign="center">
        <Heading size="2xl" color="text.primary">
          Welcome to Rust Bootstrap
        </Heading>
        <Text fontSize="lg" color="text.secondary">
          A powerful desktop application for managing your development projects,
          kits, blueprints, and more.
        </Text>
        <Button
          size="lg"
          colorScheme="primary"
          onClick={handleGetStarted}
        >
          Get Started
        </Button>
      </VStack>
    </Box>
  );
}

