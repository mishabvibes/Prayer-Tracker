'use client';

import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Users } from 'lucide-react';
import { useApp } from '@/lib/context';
import { FARDH_PRAYERS, RAWATIB_PRAYERS, JAMAA_PRAYERS, PRAYER_LABELS } from '@/lib/types';

export default function ExportPage() {
  const { students, records, homeworks, assignments, classInfo, selectedMonth, selectedYear } = useApp();

  const [exportType, setExportType] = useState<'monthly' | 'student' | 'full'>('monthly');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

  const handleExportCSV = () => {
    setExporting(true);

    let csvContent = '';
    let filename = '';

    const monthRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const targetRecords = exportType === 'full' ? records :
      exportType === 'student' && selectedStudentId !== 'all' ?
        monthRecords.filter(r => r.studentId === selectedStudentId) :
        monthRecords;

    // Build CSV headers
    const headers = [
      'Date', 'Student', 'Student (Arabic)',
      ...FARDH_PRAYERS.map(p => `Fardh: ${PRAYER_LABELS[p]}`),
      ...RAWATIB_PRAYERS.map(p => `Rawatib: ${PRAYER_LABELS[p]}`),
      ...JAMAA_PRAYERS.map(p => `Jamaa: ${PRAYER_LABELS[p]}`),
      'Attendance', 'Behaviour Score', 'Notes'
    ];

    csvContent += headers.join(',') + '\n';

    for (const record of targetRecords) {
      const student = students.find(s => s.id === record.studentId);
      if (!student) continue;

      const row = [
        record.date,
        `"${student.nameEn}"`,
        `"${student.nameAr}"`,
        ...FARDH_PRAYERS.map(p => record[p] === null ? '' : record[p]),
        ...RAWATIB_PRAYERS.map(p => record[p] === null ? '' : record[p]),
        ...JAMAA_PRAYERS.map(p => record[p] === null ? '' : record[p]),
        record.attendance || '',
        record.behaviourScore || '',
        `"${record.notes || ''}"`,
      ];

      csvContent += row.join(',') + '\n';
    }

    filename = exportType === 'full' ? `swala-tracker-full-export.csv` :
      exportType === 'student' && selectedStudentId !== 'all' ?
        `swala-${students.find(s => s.id === selectedStudentId)?.nameEn || 'student'}-${monthName}.csv` :
        `swala-tracker-${monthName}.csv`;

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace(/\s+/g, '-').toLowerCase();
    link.click();

    setTimeout(() => setExporting(false), 1000);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <Download size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Export Centre
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Download reports and data as CSV files
        </p>
      </div>

      {/* Export Type Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', maxWidth: 800 }}>
        {[
          { type: 'monthly' as const, icon: Calendar, label: 'Monthly Report', desc: `Export all records for ${monthName}` },
          { type: 'student' as const, icon: Users, label: 'Student Report', desc: 'Export a specific student\'s data' },
          { type: 'full' as const, icon: FileSpreadsheet, label: 'Full Database', desc: 'Export all records ever recorded' },
        ].map(opt => (
          <button
            key={opt.type}
            className={`glass-panel`}
            style={{
              padding: 'var(--space-6)',
              cursor: 'pointer',
              textAlign: 'left',
              border: exportType === opt.type ? '1px solid rgba(99, 102, 241, 0.4)' : undefined,
              background: exportType === opt.type ? 'rgba(99, 102, 241, 0.08)' : undefined,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
            }}
            onClick={() => setExportType(opt.type)}
          >
            <opt.icon size={24} style={{ color: exportType === opt.type ? 'var(--primary-400)' : 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Student Selector */}
      {exportType === 'student' && (
        <div className="glass-panel-static animate-in" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', maxWidth: 400 }}>
          <label className="label">Select Student</label>
          <select className="select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
            <option value="all">All Students</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.nameEn} — {s.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {/* Export Preview */}
      <div className="glass-panel-static" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', maxWidth: 600 }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📄 Export Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            { label: 'Class', value: classInfo.name },
            { label: 'Export Type', value: exportType === 'monthly' ? `Monthly — ${monthName}` : exportType === 'student' ? 'Student Report' : 'Full Database' },
            { label: 'Records', value: (() => {
              const monthRecords = records.filter(r => {
                const d = new Date(r.date);
                return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
              });
              return exportType === 'full' ? records.length :
                exportType === 'student' && selectedStudentId !== 'all' ?
                  monthRecords.filter(r => r.studentId === selectedStudentId).length :
                  monthRecords.length;
            })() },
            { label: 'Format', value: 'CSV (Comma Separated Values)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{String(item.value)}</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: 'var(--space-6)', width: '100%', justifyContent: 'center' }}
          onClick={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? (
            <>Exporting...</>
          ) : (
            <>
              <FileText size={18} />
              Download CSV
            </>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="glass-panel-static" style={{ padding: 'var(--space-6)', maxWidth: 600, opacity: 0.7 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-3)' }}>💡 Export Tips</h4>
        <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 'var(--space-5)' }}>
          <li>CSV files can be opened in Excel, Google Sheets, or any spreadsheet app</li>
          <li>Monthly reports include all prayer columns (Fardh, Rawatib, Jamaa), attendance, and behaviour scores</li>
          <li>Use &quot;Full Database&quot; export for a complete backup of all your data</li>
          <li>Arabic names are included alongside English names in every export</li>
        </ul>
      </div>
    </div>
  );
}
