'use client';

import React, { useEffect, useState } from 'react';
import { Joyride, EventData, STATUS, Step, TooltipRenderProps } from 'react-joyride';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import styles from './ProductTour.module.css';

function Tooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) {
  return (
    <div className={styles.tooltip} {...tooltipProps}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Sparkles size={16} className={styles.icon} />
          {step.title || 'Quick Guide'}
        </div>
        <button
          {...closeProps}
          className="btn-icon"
          style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.content}>
        {step.content}
      </div>

      <div className={styles.footer}>
        <div className={styles.progress}>
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            />
          ))}
        </div>
        <div className={styles.actions}>
          {index > 0 && (
            <button {...backProps} className={styles.btnBack}>
              Back
            </button>
          )}
          <button {...primaryProps} className={styles.btnNext}>
            {isLastStep ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Finish <Check size={14} />
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Next <ChevronRight size={14} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      title: 'Welcome to FajrFlow!',
      content: 'Let\'s take a quick tour to get you started with tracking your class seamlessly.',
      skipBeacon: true,
    },
    {
      target: 'nav', // Sidebar
      title: 'Navigation Hub',
      content: 'Here is your main navigation. Access your dashboard, students, monthly grid, and settings from here.',
      placement: 'right',
    },
    {
      target: 'nav [href="/dashboard"]',
      title: 'Dashboard Overview',
      content: 'The Dashboard gives you a bird\'s-eye view of your class performance, attendance rates, and recent activities.',
      placement: 'right',
    },
    {
      target: 'nav [href="/students"]',
      title: 'Manage Students',
      content: 'Add new students to your class, view their individual profiles, and monitor their overall progress.',
      placement: 'right',
    },
    {
      target: 'nav [href="/grid"]',
      title: 'Monthly Tracker Grid',
      content: 'This is where you\'ll log daily prayers, mark attendance, and record behaviour scores for your entire class efficiently.',
      placement: 'right',
    },
    {
      target: 'nav [href="/settings"]',
      title: 'Class Settings',
      content: 'Update your class details, manage application settings, and customize your experience here.',
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
      tooltipComponent={Tooltip}
      options={{
        zIndex: 10000,
        primaryColor: '#6366f1',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        arrowColor: '#1e1e2d',
      }}
    />
  );
}
