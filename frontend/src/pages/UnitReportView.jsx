import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, AlertTriangle, Users, Download } from 'lucide-react';
import api from '../api';

const UnitReportView = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [unitId]);

  const fetchData = async () => {
    try {
      const [unitRes, assignRes, subRes] = await Promise.all([
        api.get(`units/${unitId}/`),
        api.get('assignments/'),
        api.get('submissions/')
      ]);
      setUnit(unitRes.data);
      
      const unitAssignments = assignRes.data.filter(a => a.unit === Number(unitId)).map(a => a.id);
      const unitSubmissions = subRes.data.filter(s => unitAssignments.includes(s.assignment));
      
      setSubmissions(unitSubmissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading Report...</div>;

  const scannedSubs = submissions.filter(s => s.status === 'scanned' && s.report);
  const totalScanned = scannedSubs.length;
  const avgScore = totalScanned ? (scannedSubs.reduce((acc, s) => acc + s.report.overall_score, 0) / totalScanned).toFixed(2) : 0;
  
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0 };
  scannedSubs.forEach(s => {
      if (s.report.grade) gradeDistribution[s.report.grade]++;
  });

  const topRisks = [...scannedSubs].sort((a,b) => b.report.overall_score - a.report.overall_score).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="glass-panel" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', borderRadius: 0 }}>
        <div>
          <button onClick={() => navigate(`/lecturer/unit/${unitId}`)} className="btn-secondary no-print" style={{ padding: '8px 16px', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Module
          </button>
          <h1 style={{ fontSize: '28px', margin: 0 }}>{unit?.name} ({unit?.code}) Unit Report</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aggregated plagiarism and academic integrity statistics.</p>
        </div>
        <div className="no-print">
          <button onClick={() => window.print()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <div style={{ padding: '40px', flex: 1 }} className="container">
        {/* KPI Row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Total Submissions Scanned</p>
              <h2 style={{ margin: 0, fontSize: '28px' }}>{totalScanned} <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>of {submissions.length} total</span></h2>
            </div>
          </div>
          
          <div className="glass-card" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <BarChart2 size={32} color="var(--color-success)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Average Similarity Score</p>
              <h2 style={{ margin: 0, fontSize: '28px', color: avgScore > 30 ? 'var(--color-danger)' : '' }}>{avgScore}%</h2>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Grade Distribution */}
          <div className="glass-panel" style={{ flex: '1', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Grade Distribution</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['A', 'B', 'C', 'D'].map(grade => {
                const count = gradeDistribution[grade] || 0;
                const pct = totalScanned ? (count / totalScanned) * 100 : 0;
                let color = 'var(--color-success)';
                if (grade === 'C') color = 'var(--color-warning)';
                if (grade === 'D') color = 'var(--color-danger)';

                return (
                  <div key={grade}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                        <span style={{ fontWeight: 'bold' }}>Grade {grade}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{count} ({pct.toFixed(0)}%)</span>
                     </div>
                     <div style={{ height: '8px', background: 'var(--color-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: color, width: `${pct}%`, transition: 'width 1s ease' }}></div>
                     </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Highest Risk Submissions */}
          <div className="glass-panel" style={{ flex: '1', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
               <AlertTriangle size={20} color="var(--color-danger)" /> Highest Risk Submissions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {topRisks.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No risks detected.</p> : 
                topRisks.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${s.report.grade === 'D' ? 'var(--color-danger)' : 'var(--color-warning)'}` }}>
                     <div>
                        <div style={{ fontWeight: 'bold' }}>{s.uploaded_by.username}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.title}</div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: s.report.grade === 'D' ? '#fca5a5' : '#fcd34d' }}>{s.report.overall_score}%</div>
                        <button className="btn-secondary no-print" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate(`/report/${s.report.id}`)}>Review</button>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UnitReportView;
