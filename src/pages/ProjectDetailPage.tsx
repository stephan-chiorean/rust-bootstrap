import { useState } from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { KitsTabContent } from '../components/kits/KitsTabContent';
import { BlueprintsTabContent } from '../components/blueprints/BlueprintsTabContent';
import { WalkthroughsTabContent } from '../components/walkthroughs/WalkthroughsTabContent';
import { AgentsTabContent } from '../components/agents/AgentsTabContent';
import { DiagramsTabContent } from '../components/diagrams/DiagramsTabContent';
import { ScrapbookTabContent } from '../components/scrapbook/ScrapbookTabContent';

type TabId = 'kits' | 'blueprints' | 'walkthroughs' | 'agents' | 'diagrams' | 'scrapbook';

export function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState<TabId>('kits');

  const tabs = [
    { id: 'kits' as TabId, label: 'Kits' },
    { id: 'blueprints' as TabId, label: 'Blueprints' },
    { id: 'walkthroughs' as TabId, label: 'Walkthroughs' },
    { id: 'agents' as TabId, label: 'Agents' },
    { id: 'diagrams' as TabId, label: 'Diagrams' },
    { id: 'scrapbook' as TabId, label: 'Scrapbook' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'kits':
        return <KitsTabContent />;
      case 'blueprints':
        return <BlueprintsTabContent />;
      case 'walkthroughs':
        return <WalkthroughsTabContent />;
      case 'agents':
        return <AgentsTabContent />;
      case 'diagrams':
        return <DiagramsTabContent />;
      case 'scrapbook':
        return <ScrapbookTabContent />;
      default:
        return <KitsTabContent />;
    }
  };

  return (
    <Box bg="bg.main" minH="100vh">
      <Box px={8} pt={4} borderBottomWidth="1px" bg="bg.header">
        <HStack gap={2}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </HStack>
      </Box>
      <Box>{renderTabContent()}</Box>
    </Box>
  );
}

