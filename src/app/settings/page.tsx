'use client';

import React, { useState, useEffect } from 'react';
import { Settings, MapPin, BookOpen, UserCircle, Shield, Save, Key, Mail } from 'lucide-react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const { classInfo, teacher, students } = useApp();
  
  const [className, setClassName] = useState('');
  const [location, setLocation] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = teacher?.role === 'admin';

  useEffect(() => {
    if (classInfo) {
      setClassName(classInfo.name);
      setLocation(classInfo.location);
    }
    if (teacher) {
      setTeacherName(teacher.name);
    }
  }, [classInfo, teacher]);

  const handleSave = async () => {
    if (!teacher) return;
    setIsSaving(true);
    setMessage('');

    try {
      // Update Teacher profile
      const { error: tError } = await supabase
        .from('teachers')
        .update({ name: teacherName })
        .eq('id', teacher.id);
      
      if (tError) throw tError;

      // Update Class info if they have one and are not just a global admin
      if (classInfo && !isAdmin) {
        const { error: cError } = await supabase
          .from('classes')
          .update({ name: className, location })
          .eq('id', classInfo.id);
        
        if (cError) throw cError;
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setMessage('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both', maxWidth: 800, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 'var(--space-8)',
        paddingBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)', borderRadius: 'var(--radius-lg)' }}>
              <Settings size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              {isAdmin ? 'System Profile' : 'Settings & Profile'}
            </h1>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {isAdmin 
              ? 'Manage your personal administrator account details.' 
              : 'Configure your class details and update your personal information.'}
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={isSaving} style={{ boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}>
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: 'var(--space-4)', 
          background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: message.includes('Error') ? 'var(--danger)' : 'var(--success)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
          border: `1px solid ${message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          fontWeight: 500
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        
        {/* Personal Profile Section (For Everyone) */}
        <section>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCircle size={20} className="text-primary-400" /> Personal Information
          </h2>
          <div className="glass-panel-static" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
            <div style={{
              width: 96, height: 96,
              borderRadius: 'var(--radius-2xl)',
              background: isAdmin 
                ? 'var(--primary-600)'
                : 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-inverse)',
              flexShrink: 0,
              boxShadow: 'var(--glass-shadow)'
            }}>
              {teacher?.name?.charAt(0) || 'T'}
            </div>
            
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Full Name</label>
                <input className="input" value={teacherName} onChange={e => setTeacherName(e.target.value)} style={{ fontSize: '1.0625rem', padding: '12px 16px' }} />
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> Email Address</label>
                <input className="input" value={teacher?.email || ''} type="email" disabled style={{ opacity: 0.7, background: 'rgba(255,255,255,0.02)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>Contact support to change email</span>
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14} /> Account Role</label>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center', padding: '0 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`}>
                    {isAdmin ? 'System Administrator' : 'Teacher'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Password placeholder */}
        <section>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={20} className="text-accent-400" /> Security
          </h2>
          <div className="glass-panel-static" style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Password</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Update your password to keep your account secure.</div>
            </div>
            <button className="btn btn-glass" onClick={() => alert('Password reset emails will be sent via Supabase Auth. Coming soon.')}>
              Request Password Reset
            </button>
          </div>
        </section>

        {/* Class Information (ONLY FOR TEACHERS) */}
        {!isAdmin && (
          <section className="animate-in animate-in-delay-1">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} className="text-success" /> Class Configuration
            </h2>
            <div className="glass-panel-static" style={{ padding: 'var(--space-6)' }}>
              
              {!classInfo ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                  No class assigned to you yet. Please contact an admin.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Class Name</label>
                    <input className="input" value={className} onChange={e => setClassName(e.target.value)} style={{ fontSize: '1.0625rem', padding: '12px 16px' }} />
                  </div>

                  <div>
                    <label className="label">Physical Location / Room</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input className="input" value={location} onChange={e => setLocation(e.target.value)} style={{ paddingLeft: 42 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Class Stats */}
            {classInfo && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div className="glass-panel-static" style={{ padding: 'var(--space-4)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-300)' }}>{students.length}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</div>
                </div>
                <div className="glass-panel-static" style={{ padding: 'var(--space-4)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>1</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher</div>
                </div>
                <div className="glass-panel-static" style={{ padding: 'var(--space-4)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-400)' }}>{teacher?.status === 'suspended' ? 'Suspended' : 'Active'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
