'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import { mapTeacher, mapClass } from '@/lib/supabase/mappers';
import { Teacher, ClassInfo, UserRole } from '@/lib/types';
import { Shield, Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const supabase = createClient();
  const { teacher, isLoggedIn, dataLoading } = useApp();
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // New Class Form
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassLocation, setNewClassLocation] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');

  // Edit Class Form
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassLocation, setEditClassLocation] = useState('');
  const [editClassTeacherId, setEditClassTeacherId] = useState('');

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('teacher');
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'active'|'suspended'>('active');

  // Create Teacher Form
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState<UserRole>('teacher');
  const [createTeacherError, setCreateTeacherError] = useState('');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

  useEffect(() => {
    if (!dataLoading && (!isLoggedIn || teacher?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoggedIn, teacher, dataLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teachersRes, classesRes] = await Promise.all([
        supabase.from('teachers').select('*').order('created_at', { ascending: false }),
        supabase.from('classes').select('*').order('created_at', { ascending: false }),
      ]);
      if (teachersRes.data) setTeachers(teachersRes.data.map(mapTeacher));
      if (classesRes.data) setClasses(classesRes.data.map(mapClass));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (teacher?.role === 'admin') {
      fetchData();
    }
  }, [teacher]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    
    const { data, error } = await supabase.from('classes').insert({
      name: newClassName,
      location: newClassLocation,
      teacher_id: newClassTeacherId || null,
    }).select().single();

    if (!error && data) {
      setClasses([mapClass(data), ...classes]);
      setShowClassModal(false);
      setNewClassName('');
      setNewClassLocation('');
      setNewClassTeacherId('');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This will delete all associated students and records.')) return;
    await supabase.from('classes').delete().eq('id', id);
    setClasses(classes.filter(c => c.id !== id));
  };

  const openEditClass = (c: ClassInfo) => {
    setEditingClass(c);
    setEditClassName(c.name);
    setEditClassLocation(c.location);
    setEditClassTeacherId(c.teacherId || '');
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    const { error } = await supabase.from('classes').update({
      name: editClassName,
      location: editClassLocation,
      teacher_id: editClassTeacherId || null,
    }).eq('id', editingClass.id);

    if (!error) {
      setClasses(classes.map(c => c.id === editingClass.id ? { 
        ...c, 
        name: editClassName, 
        location: editClassLocation, 
        teacherId: editClassTeacherId || '' 
      } : c));
      setShowEditClassModal(false);
      setEditingClass(null);
    }
  };

  const openEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setEditRole(t.role);
    setEditName(t.name);
    setEditStatus(t.status || 'active');
    setShowTeacherModal(true);
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    const { error } = await supabase.from('teachers').update({ 
      role: editRole, 
      name: editName, 
      status: editStatus 
    }).eq('id', editingTeacher.id);
    
    if (!error) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, role: editRole, name: editName, status: editStatus } : t));
      setShowTeacherModal(false);
      setEditingTeacher(null);
    }
  };

  const handleDeleteTeacher = async (authId: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete ${name}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/delete-teacher?id=${authId}`, { method: 'DELETE' });
      if (res.ok) {
        setTeachers(teachers.filter(t => t.authId !== authId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete teacher');
      }
    } catch (err: any) {
      alert('Error deleting teacher');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTeacherError('');
    setIsCreatingTeacher(true);

    try {
      const res = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newTeacherEmail,
          password: newTeacherPassword,
          name: newTeacherName,
          role: newTeacherRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateTeacherError(data.error || 'Failed to create teacher.');
      } else {
        setShowCreateTeacherModal(false);
        setNewTeacherName('');
        setNewTeacherEmail('');
        setNewTeacherPassword('');
        setNewTeacherRole('teacher');
        fetchData(); // Refresh the list
      }
    } catch (err: any) {
      setCreateTeacherError(err.message);
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  if (dataLoading || loading) return <div style={{ padding: 'var(--space-8)' }}>Loading...</div>;
  if (!teacher || teacher.role !== 'admin') return null;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <Shield size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--primary-400)' }} />
          Admin Portal
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Manage teachers, classes, and system access.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Classes Section */}
        <div className="glass-panel-static" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} /> Classes ({classes.length})
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowClassModal(true)}>
              <Plus size={14} /> New Class
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {classes.map(c => {
              const teacherName = teachers.find(t => t.id === c.teacherId)?.name || 'Unassigned';
              return (
                <div key={c.id} style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Teacher: {teacherName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" onClick={() => openEditClass(c)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteClass(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teachers Section */}
        <div className="glass-panel-static" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} /> Teachers ({teachers.length})
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateTeacherModal(true)}>
              <Plus size={14} /> New Teacher
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {teachers.map(t => (
              <div key={t.id} style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t.name}
                    {t.role === 'admin' && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>Admin</span>}
                    {t.status === 'suspended' && <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '2px 4px' }}>Suspended</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openEditTeacher(t)}>
                    <Edit2 size={16} />
                  </button>
                  {t.authId !== teacher?.authId && (
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTeacher(t.authId, t.name)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Class</h2>
              <button className="btn-icon" onClick={() => setShowClassModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClass} className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Class Name *</label>
                <input className="input" autoFocus required value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Assign Teacher</label>
                <select className="select" value={newClassTeacherId} onChange={e => setNewClassTeacherId(e.target.value)}>
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Location</label>
                <input className="input" value={newClassLocation} onChange={e => setNewClassLocation(e.target.value)} />
              </div>
              <div className="modal-footer" style={{ marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowClassModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditClassModal && editingClass && (
        <div className="modal-overlay" onClick={() => setShowEditClassModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Class: {editingClass.name}</h2>
              <button className="btn-icon" onClick={() => setShowEditClassModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateClass} className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Class Name *</label>
                <input className="input" autoFocus required value={editClassName} onChange={e => setEditClassName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Assign Teacher</label>
                <select className="select" value={editClassTeacherId} onChange={e => setEditClassTeacherId(e.target.value)}>
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Location</label>
                <input className="input" value={editClassLocation} onChange={e => setEditClassLocation(e.target.value)} />
              </div>
              <div className="modal-footer" style={{ marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowEditClassModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Edit Modal */}
      {showTeacherModal && editingTeacher && (
        <div className="modal-overlay" onClick={() => setShowTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Teacher: {editingTeacher.name}</h2>
              <button className="btn-icon" onClick={() => setShowTeacherModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateTeacher} className="modal-body">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Name</label>
                <input className="input" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Role</label>
                <select className="select" value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Status</label>
                <select className="select" value={editStatus} onChange={e => setEditStatus(e.target.value as 'active'|'suspended')}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowTeacherModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      {showCreateTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowCreateTeacherModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Teacher</h2>
              <button className="btn-icon" onClick={() => setShowCreateTeacherModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTeacher} className="modal-body">
              {createTeacherError && <div style={{ color: 'var(--danger)', marginBottom: 16, fontSize: '0.875rem' }}>{createTeacherError}</div>}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Full Name *</label>
                <input className="input" autoFocus required value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Email Address *</label>
                <input className="input" type="email" required value={newTeacherEmail} onChange={e => setNewTeacherEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Temporary Password *</label>
                <input className="input" type="text" required minLength={6} value={newTeacherPassword} onChange={e => setNewTeacherPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Role</label>
                <select className="select" value={newTeacherRole} onChange={e => setNewTeacherRole(e.target.value as UserRole)}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowCreateTeacherModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreatingTeacher}>
                  {isCreatingTeacher ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
