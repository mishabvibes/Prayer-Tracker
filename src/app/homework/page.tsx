'use client';

import React, { useMemo, useState } from 'react';
import { ClipboardList, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { useApp } from '@/lib/context';
import { HomeworkStatus } from '@/lib/types';

export default function HomeworkPage() {
  const { students, assignments, homeworks } = useApp();
  const [filterStatus, setFilterStatus] = useState<HomeworkStatus | 'all'>('all');
  const [filterAssignment, setFilterAssignment] = useState<string>('all');

  const filtered = useMemo(() => {
    return homeworks.filter(h => {
      if (filterStatus !== 'all' && h.status !== filterStatus) return false;
      if (filterAssignment !== 'all' && h.assignmentId !== filterAssignment) return false;
      return true;
    });
  }, [homeworks, filterStatus, filterAssignment]);

  const statusIcon = (status: HomeworkStatus) => {
    switch (status) {
      case 'submitted': return <CheckCircle size={14} />;
      case 'late': return <Clock size={14} />;
      case 'missing': return <XCircle size={14} />;
    }
  };

  const statusClass = (status: HomeworkStatus) => {
    switch (status) {
      case 'submitted': return 'badge-success';
      case 'late': return 'badge-warning';
      case 'missing': return 'badge-danger';
    }
  };

  // Summary per assignment
  const assignmentSummaries = useMemo(() => {
    return assignments.map(a => {
      const aHomeworks = homeworks.filter(h => h.assignmentId === a.id);
      return {
        ...a,
        submitted: aHomeworks.filter(h => h.status === 'submitted').length,
        late: aHomeworks.filter(h => h.status === 'late').length,
        missing: aHomeworks.filter(h => h.status === 'missing').length,
        total: aHomeworks.length,
      };
    });
  }, [assignments, homeworks]);

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Homework Tracker</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {assignments.length} assignments · {students.length} students
          </p>
        </div>
      </div>

      {/* Assignment Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {assignmentSummaries.map((a, i) => (
          <div key={a.id} className="glass-panel" style={{ padding: 'var(--space-5)', cursor: 'pointer', animationDelay: `${i * 0.05}s` }} onClick={() => setFilterAssignment(filterAssignment === a.id ? 'all' : a.id)}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              background: filterAssignment === a.id ? 'var(--primary-400)' : 'transparent',
              transition: 'background var(--transition-fast)',
            }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{a.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
              Due: {new Date(a.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--success)' }}>✓ {a.submitted}</span>
              <span style={{ color: 'var(--warning)' }}>⏱ {a.late}</span>
              <span style={{ color: 'var(--danger)' }}>✕ {a.missing}</span>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 'var(--space-3)', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(a.submitted / a.total) * 100}%`, background: 'var(--success)', height: '100%' }} />
              <div style={{ width: `${(a.late / a.total) * 100}%`, background: 'var(--warning)', height: '100%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)', marginRight: 4 }} />
        {(['all', 'submitted', 'late', 'missing'] as const).map(status => (
          <button
            key={status}
            className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-glass'}`}
            onClick={() => setFilterStatus(status)}
            style={{ textTransform: 'capitalize' }}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel-static" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Student</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assignment</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((hw, idx) => {
                const student = students.find(s => s.id === hw.studentId);
                const assignment = assignments.find(a => a.id === hw.assignmentId);
                if (!student || !assignment) return null;
                return (
                  <tr key={hw.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                          background: `hsl(${(idx * 25) % 360}, 55%, 50%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {student.nameEn.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{student.nameEn}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{assignment.title}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span className={`badge ${statusClass(hw.status)}`}>
                        {statusIcon(hw.status)} {hw.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--text-tertiary)' }}>
                      {new Date(assignment.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
