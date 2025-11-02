import { useEffect, useState } from 'react';
import { Onboarding } from '@/components/Onboarding';
import { Home } from '@/components/Home';
import { storage } from '@/lib/storage';
import '@/lib/i18n';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const profile = storage.getProfile();
    setShowOnboarding(!profile);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return <Home />;
};

export default Index;
