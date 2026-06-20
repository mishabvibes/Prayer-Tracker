'use client';

import React from 'react';
import { Settings, MapPin, BookOpen, UserCircle, Shield } from 'lucide-react';
import { useApp } from '@/lib/context';

export default function SettingsPage() {
  const { classInfo, teacher, students } = useApp();

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both', maxWidth: 700 }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <Settings size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Class Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Manage your class configuration and teacher profile
        </p>
      </div>

      {/* Class Info */}
      <div className="glass-panel-static animate-in animate-in-delay-1" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} /> Class Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">Class Name</label>
            <input className="input" defaultValue={classInfo.name} />
          </div>
          <div>
            <label className="label">Lesson Name</label>
            <input className="input" defaultValue={classInfo.lessonName} dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }} />
          </div>
          <div>
            <label className="label">Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input className="input" defaultValue={classInfo.location} style={{ paddingLeft: 36 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Profile */}
      <div className="glass-panel-static animate-in animate-in-delay-2" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCircle size={18} /> Teacher Profile
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--accent-400), var(--accent-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-inverse)',
            flexShrink: 0,
          }}>
            {teacher.name.charAt(0)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Name</label>
              <input className="input" defaultValue={teacher.name} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" defaultValue={teacher.email} type="email" />
            </div>
            <div>
              <label className="label">Role</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={16} style={{ color: 'var(--primary-400)' }} />
                <span className="badge badge-primary">{teacher.role === 'admin' ? 'Admin Teacher' : 'Teacher'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-panel-static animate-in animate-in-delay-3" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 Class Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-300)' }}>{students.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Students</div>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>1</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Teachers</div>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-400)' }}>Active</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Status</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel-static animate-in animate-in-delay-4" style={{ padding: 'var(--space-6)', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--danger)' }}>⚠️ Danger Zone</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          These actions are irreversible. Please be careful.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-danger btn-sm">Reset All Records</button>
          <button className="btn btn-glass btn-sm" style={{ borderColor: 'rgba(248, 113, 113, 0.2)', color: 'var(--danger)' }}>Delete Class</button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
        <button className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>Save Changes</button>
      </div>
    </div>
  );
}
