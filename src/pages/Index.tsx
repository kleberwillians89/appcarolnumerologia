
import React from 'react';
import AppLayout, { AppTab } from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

interface IndexProps {
  initialTab?: AppTab;
}

const Index: React.FC<IndexProps> = ({ initialTab }) => {
  return (
    <AppProvider>
      <AppLayout initialTab={initialTab} />
    </AppProvider>
  );
};

export default Index;
