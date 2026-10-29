/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventProvider, useEvents } from './context/EventContext';
import { WelcomeExperience } from './components/common/WelcomeExperience';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { FieldGuideModal } from './components/common/FieldGuideModal';
import { ToastContainer } from './components/common/Toast';
import { editorialFieldGuides } from './data/initialData';
import { ActiveTab } from './types';

const AppContent: React.FC = () => {
  const { currentEvent, activeTab, setActiveTab, toasts, dismissToast, showToast } = useEvents();
  
  // Screen routing state
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'dashboard'>('landing');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState<string>(editorialFieldGuides[0].id);

  // Check if welcome intro was already completed this session
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('utsav_celebration_intro_session') !== 'true';
    } catch {
      return true;
    }
  });

  const handleStartPlanning = () => {
    setCurrentScreen('dashboard');
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCelebrations = () => {
    setCurrentScreen('landing');
    setTimeout(() => {
      const el = document.getElementById('popular-events');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }, 120);
  };

  const handleDismissWelcome = (target?: 'plan' | 'explore' | 'skip') => {
    setShowWelcome(false);
    if (target === 'plan') {
      handleStartPlanning();
    } else if (target === 'explore') {
      handleExploreCelebrations();
    } else {
      setCurrentScreen('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenGuidesModal = (guideId?: string) => {
    if (guideId) {
      setActiveGuideId(guideId);
    }
    setIsGuideOpen(true);
  };

  const handleNavigate = (tab: ActiveTab) => {
    if (tab === 'landing') {
      setCurrentScreen('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentScreen('dashboard');
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-ivory-warm text-ink font-sans selection:bg-gold/30 selection:text-plum">
      {/* Celebration Opening Welcome Experience */}
      <WelcomeExperience 
        isOpen={showWelcome} 
        onDismiss={handleDismissWelcome} 
      />

      {/* Screen Router */}
      {currentScreen === 'landing' ? (
        <div className="flex flex-col min-h-screen">
          <Header
            currentTab="landing"
            onNavigate={handleNavigate}
            onReopenWelcome={() => setShowWelcome(true)}
            onOpenQuickPlan={handleStartPlanning}
            onOpenGuidesModal={() => handleOpenGuidesModal()}
          />
          
          <main className="flex-1">
            <LandingPage
              onNavigate={handleNavigate}
              onOpenGuidesModal={handleOpenGuidesModal}
              onShowToast={showToast}
            />
          </main>

          <Footer
            onNavigate={handleNavigate}
            onReopenWelcome={() => setShowWelcome(true)}
            onOpenGuidesModal={() => handleOpenGuidesModal()}
          />
        </div>
      ) : (
        <DashboardLayout
          onBackToHome={() => {
            setCurrentScreen('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenFieldGuide={(guideId) => handleOpenGuidesModal(guideId)}
          onReopenWelcome={() => setShowWelcome(true)}
        />
      )}

      {/* Editorial Field Guide Archive Reader Modal */}
      <FieldGuideModal
        isOpen={isGuideOpen}
        initialGuideId={activeGuideId}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Reactive Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
