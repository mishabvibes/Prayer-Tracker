'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  BarChart3, Download, Settings, Menu, X, BookOpen,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Students', href: '/students', icon: Users },
  { label: 'Monthly Grid', href: '/grid', icon: CalendarDays },
  { label: 'Homework', href: '/homework', icon: ClipboardList },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Export', href: '/export', icon: Download },
];

const SETTINGS_ITEMS = [
  { label: 'Class Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { teacher, classInfo, students } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>🕌</div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>Swala Tracker</span>
              <span className={styles.brandSub}>جدول السير والسلوك</span>
            </div>
            {/* Close on mobile */}
            <button
              className={styles.mobileToggle}
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
              style={{ display: isOpen ? 'flex' : undefined, position: 'static', width: 32, height: 32 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Class info pill */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
            marginBottom: '8px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Current Class</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-300)' }}>
              <BookOpen size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {classInfo.name}
            </div>
          </div>

          {/* Main Nav */}
          <nav className={styles.nav}>
            <div className={styles.navSection}>Main</div>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
                {item.label === 'Students' && (
                  <span className={styles.navBadge}>{students.length}</span>
                )}
              </Link>
            ))}

            <div className={styles.navSection}>Manage</div>
            {SETTINGS_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User card */}
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {teacher.name.charAt(0)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{teacher.name}</span>
              <span className={styles.userRole}>{teacher.role === 'admin' ? 'Admin Teacher' : 'Teacher'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
