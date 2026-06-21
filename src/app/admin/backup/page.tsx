'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import { Download, Database, Users, BookOpen, Shield, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminBackupPage() {
  const supabase = createClient();
  const { teacher, isLoggedIn, dataLoading } = useApp();
  const router = useRouter();

  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Protect route
  if (!dataLoading && (!isLoggedIn || teacher?.role !== 'admin')) {
    router.push('/');
    return null;
  }

  const generateCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`; // quote all fields to avoid comma issues
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTable = async (tableName: string) => {
    setIsExporting(true);
    setExportStatus(`Exporting ${tableName}...`);
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        generateCSV(data, tableName);
        setExportStatus(`Successfully exported ${tableName} (${data.length} records)`);
      } else {
        setExportStatus(`No data found in ${tableName}`);
      }
    } catch (err: any) {
      console.error(err);
      setExportStatus(`Error exporting ${tableName}: ${err.message}`);
    }
    setIsExporting(false);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    setExportStatus('Starting full system backup...');
    
    const tables = ['teachers', 'classes', 'students', 'daily_records', 'student_notes', 'assignments', 'homework'];
    
    try {
      for (const table of tables) {
        setExportStatus(`Exporting ${table}...`);
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          generateCSV(data, table);
          // Small delay to allow the browser to process multiple downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      setExportStatus('Full system backup completed successfully!');
    } catch (err: any) {
      console.error(err);
      setExportStatus(`Error during full backup: ${err.message}`);
    }
    setIsExporting(false);
  };

  if (dataLoading || !teacher) return <div style={{ padding: 'var(--space-8)' }}>Loading...</div>;

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <div className="page-header-mobile">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)', borderRadius: 'var(--radius-lg)' }}>
              <Database size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Advanced Backup & Export
            </h1>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Generate and download raw CSV backups of all system data tables securely.
          </p>
        </div>
      </div>

      {exportStatus && (
        <div className="animate-in" style={{ 
          padding: 'var(--space-4)', 
          background: exportStatus.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          color: exportStatus.includes('Error') ? 'var(--danger)' : 'var(--primary-300)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          border: `1px solid ${exportStatus.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          {exportStatus.includes('Error') ? <Shield size={18} /> : <Download size={18} />}
          {exportStatus}
        </div>
      )}

      {/* Full Backup Panel */}
      <div className="glass-panel flex-between-mobile-col" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ padding: 16, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Download size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Full System Backup</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 400 }}>
              Download a complete CSV backup of every table. Your browser may ask for permission to download multiple files.
            </p>
          </div>
        </div>
        <button 
          className="btn btn-lg" 
          onClick={handleExportAll} 
          disabled={isExporting}
          style={{ background: 'var(--success)', color: '#000', fontWeight: 700, whiteSpace: 'nowrap', width: '100%', maxWidth: '250px', justifyContent: 'center' }}
        >
          {isExporting ? 'Processing...' : 'Generate Full Backup'}
        </button>
      </div>

      {/* Individual Table Exports */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={18} className="text-primary-400" /> Specific Table Exports
      </h3>
      
      <div className="grid-cols-4">
        
        <div className="glass-panel" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)', borderRadius: 'var(--radius-md)' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Teachers</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Staff accounts</div>
            </div>
          </div>
          <button className="btn btn-glass" onClick={() => handleExportTable('teachers')} disabled={isExporting} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Classes</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>All configurations</div>
            </div>
          </div>
          <button className="btn btn-glass" onClick={() => handleExportTable('classes')} disabled={isExporting} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-400)', borderRadius: 'var(--radius-md)' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Students</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Enrolled students</div>
            </div>
          </div>
          <button className="btn btn-glass" onClick={() => handleExportTable('students')} disabled={isExporting} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 10, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-md)' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Daily Records</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Attendance & logs</div>
            </div>
          </div>
          <button className="btn btn-glass" onClick={() => handleExportTable('daily_records')} disabled={isExporting} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

      </div>

    </div>
  );
}
