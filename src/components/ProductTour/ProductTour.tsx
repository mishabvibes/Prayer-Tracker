'use client';

import React, { useEffect, useState } from 'react';
import { Joyride, EventData, STATUS, Step } from 'react-joyride';
import { usePathname } from 'next/navigation';

export default function ProductTour() {
  const [isMounted, setIsMounted] = useState(false);
  const [run, setRun] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    // Only run on the dashboard for now
    if (pathname !== '/dashboard') return;

    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem('fajrflow_tour_completed');
    if (!hasSeenTour) {
      // Small delay to ensure DOM elements are loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isMounted) return null;

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: 'Welcome to FajrFlow! Let\'s take a quick tour to get you started.',
      skipBeacon: true,
    },
    {
      target: 'nav', // Sidebar
      content: 'Here is your main navigation. Access your dashboard, students, monthly grid, and settings from here.',
      placement: 'right',
    },
    {
      target: 'nav [href="/dashboard"]',
      content: 'The Dashboard gives you a bird\'s-eye view of your class performance and recent activities.',
      placement: 'right',
    },
    {
      target: 'nav [href="/students"]',
      content: 'Manage your students here. Add new students and view their individual profiles and progress.',
      placement: 'right',
    },
    {
      target: 'nav [href="/grid"]',
      content: 'The Monthly Grid is where you\'ll log daily prayers, attendance, and behaviour scores for your entire class.',
      placement: 'right',
    },
    {
      target: 'nav [href="/settings"]',
      content: 'Update your class details and application settings here.',
      placement: 'right',
    },
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('fajrflow_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        zIndex: 10000,
        primaryColor: '#6366f1', // var(--primary-500)
        backgroundColor: '#1e1e2d',
        textColor: '#e2e8f0',
        arrowColor: '#1e1e2d',
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        showProgress: true,
        buttons: ['back', 'primary', 'skip'],
      }}
      styles={{
        buttonClose: {
          display: 'none',
        },
        buttonSkip: {
          color: '#94a3b8',
        },
        buttonBack: {
          color: '#e2e8f0',
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonPrimary: {
          borderRadius: '8px',
          padding: '8px 16px',
        }
      }}
    />
  );
}
