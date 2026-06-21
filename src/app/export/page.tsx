'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Users, Printer, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import { FARDH_PRAYERS, RAWATIB_PRAYERS, JAMAA_PRAYERS, PRAYER_LABELS } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './export.module.css';

export default function ExportPage() {
  const { students, records, classInfo, selectedMonth, selectedYear } = useApp();

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

  const handleExportPDF = () => {
    setExporting(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(`FajrFlow — ${classInfo?.name || 'My Class'}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Monthly Report: ${monthName}`, 14, 30);
    
    const monthRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Summary stats
    const totalRecords = monthRecords.length;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Total Records: ${totalRecords}`, 14, 46);

    // Table
    const tableData = students.map(student => {
      const sRecords = monthRecords.filter(r => r.studentId === student.id);
      const present = sRecords.filter(r => r.attendance === 'present').length;
      const totalFardh = sRecords.filter(r => r.fajr !== null).length * 5;
      const doneFardh = sRecords.reduce((sum, r) => sum + (r.fajr||0) + (r.dhuhr||0) + (r.asr||0) + (r.maghrib||0) + (r.isha||0), 0);
      
      const prayRate = totalFardh ? Math.round((doneFardh/totalFardh)*100) : 0;
      const behScores = sRecords.filter(r => r.behaviourScore).map(r => r.behaviourScore as number);
      const avgBeh = behScores.length ? (behScores.reduce((a,b)=>a+b,0)/behScores.length).toFixed(1) : '-';

      return [
        student.nameEn,
        student.nameAr,
        present.toString(),
        `${prayRate}%`,
        avgBeh
      ];
    });

    (doc as any).autoTable({
      startY: 55,
      head: [['Student Name', 'Arabic', 'Days Present', 'Prayer Rate', 'Avg Behaviour']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { font: 'helvetica', fontSize: 9 }
    });

    const filename = `swala-tracker-report-${monthName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(filename);
    setTimeout(() => setExporting(false), 1000);
  };

  const getRecordCount = () => {
    const monthRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    return exportType === 'full' ? records.length :
      exportType === 'student' && selectedStudentId !== 'all' ?
        monthRecords.filter(r => r.studentId === selectedStudentId).length :
        monthRecords.length;
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.2, 0, 0, 1) both', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <div className={styles.header}>
        <div style={{ padding: 14, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-400)', borderRadius: 'var(--radius-lg)' }}>
          <Download size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Export Data</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Generate comprehensive CSV and PDF reports for your class.
          </p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        
        {/* Left Column: Configuration */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-5)', color: 'var(--text-primary)' }}>
            Select Report Type
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {[
              { type: 'monthly' as const, icon: Calendar, label: 'Monthly Summary', desc: `Export all class records specifically for ${monthName}` },
              { type: 'student' as const, icon: Users, label: 'Individual Student', desc: 'Focus the export on a specific student\'s performance' },
              { type: 'full' as const, icon: FileSpreadsheet, label: 'Full Class History', desc: 'A complete historical dump of all records for this class' },
            ].map(opt => {
              const isSelected = exportType === opt.type;
              return (
                <button
                  key={opt.type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--primary-400)' : 'var(--glass-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 20px rgba(99, 102, 241, 0.15)' : 'none',
                  }}
                  onClick={() => setExportType(opt.type)}
                >
                  <div style={{ 
                    padding: 12, 
                    borderRadius: 'var(--radius-lg)', 
                    background: isSelected ? 'var(--primary-500)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#fff' : 'var(--text-tertiary)'
                  }}>
                    <opt.icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: isSelected ? 'var(--primary-300)' : 'var(--text-primary)', marginBottom: 4 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                  </div>
                  {isSelected && <ChevronRight size={20} className="text-primary-400" />}
                </button>
              );
            })}
          </div>

          {exportType === 'student' && (
            <div className="glass-panel-static animate-in" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} className="text-accent-400" /> Choose Student
              </h3>
              <select 
                className="select" 
                value={selectedStudentId} 
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ fontSize: '1.0625rem', padding: '12px 16px', background: 'rgba(0,0,0,0.2)' }}
              >
                <option value="all">-- All Students in Class --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nameEn} ({s.nameAr})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Column: Preview & Action */}
        <div>
          <div className="glass-panel-static" style={{ 
            padding: 'var(--space-6)', 
            position: 'sticky', 
            top: 'var(--space-6)',
            background: 'rgba(255,255,255,0.02)',
            boxShadow: 'var(--glass-shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-4)' }}>
              Export Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Scope</div>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                  {exportType === 'monthly' ? `Monthly (${monthName})` : exportType === 'student' ? 'Student specific' : 'Full History'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Target</div>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                  {exportType === 'student' && selectedStudentId !== 'all' 
                    ? students.find(s => s.id === selectedStudentId)?.nameEn 
                    : 'Entire Class'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Records Found</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-300)' }}>
                  {getRecordCount()}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}
                onClick={handleExportCSV}
                disabled={exporting || getRecordCount() === 0}
              >
                {exporting ? 'Processing...' : <><FileText size={18} /> Download CSV</>}
              </button>
              
              {(exportType === 'monthly' || exportType === 'student') && (
                <button
                  className="btn btn-glass btn-lg"
                  style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}
                  onClick={handleExportPDF}
                  disabled={exporting || getRecordCount() === 0}
                >
                  <Printer size={18} /> Print PDF Summary
                </button>
              )}
            </div>
            
            {getRecordCount() === 0 && (
              <div style={{ marginTop: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--danger)', textAlign: 'center' }}>
                No records available to export for this selection.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
