'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import { Shield, Users, BookOpen, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminOverviewPage() {
  const supabase = createClient();
  const { teacher, isLoggedIn, dataLoading } = useApp();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalClasses: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataLoading && (!isLoggedIn || teacher?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoggedIn, teacher, dataLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (teacher?.role !== 'admin') return;
      setLoading(true);
      try {
        const [teachersRes, classesRes, studentsRes] = await Promise.all([
          supabase.from('teachers').select('id', { count: 'exact', head: true }),
          supabase.from('classes').select('id', { count: 'exact', head: true }),
          supabase.from('students').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalTeachers: teachersRes.count || 0,
          totalClasses: classesRes.count || 0,
          totalStudents: studentsRes.count || 0,
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchStats();
  }, [teacher, supabase]);

  if (dataLoading || loading) return <div style={{ padding: 'var(--space-8)' }}>Loading...</div>;
  if (!teacher || teacher.role !== 'admin') return null;

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <Shield size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--primary-400)' }} />
          System Overview
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          High-level statistics and global tracking.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div className="glass-panel-static" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)', marginBottom: 12 }}>
            <Users size={24} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalTeachers}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Teachers</div>
        </div>

        <div className="glass-panel-static" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: 12 }}>
            <BookOpen size={24} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalClasses}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active Classes</div>
        </div>

        <div className="glass-panel-static" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-400)', marginBottom: 12 }}>
            <Activity size={24} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Students</div>
        </div>
      </div>

      <div className="glass-panel-static" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>More features coming soon</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed global analytics and school-wide progress tracking will be populated here as more data flows into the system.
        </p>
      </div>
    </div>
  );
}
