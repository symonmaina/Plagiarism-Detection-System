import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertOctagon, Info, FileText, Download } from 'lucide-react';
import api from '../api';

const ReportView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`report/${id}/`);
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Report...</div>;
  if (!reportData) return <div style={{ padding: '40px', textAlign: 'center' }}>Report not found.</div>;

  const doc = reportData.document;
  const overallSimilarity = reportData.overall_score || 0;
  
  const renderHighlightedText = (text, matches) => {
    if (!text) return <p>No text available for analysis.</p>;
    
    let matchedSegments = [];
    matches.forEach(match => {
      if (match.matched_blocks) {
        match.matched_blocks.forEach(block => {
          matchedSegments.push({ text: block.matched_text, docSim: match.similarity });
        });
      }
    });

    let highlightedHtml = text;
    // Sort longer matches first to avoid nested replacement bugs
    matchedSegments.sort((a, b) => b.text.length - a.text.length);
    
    matchedSegments.forEach(seg => {
      const style = seg.docSim > 30 
        ? 'background-color: rgba(239, 68, 68, 0.25); color: #fca5a5; padding: 2px; border-radius: 3px;' 
        : 'background-color: rgba(252, 211, 77, 0.25); color: #fcd34d; padding: 2px; border-radius: 3px;';
        
      const escapedText = seg.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'gi');
      highlightedHtml = highlightedHtml.replace(regex, `<span style="${style}">$1</span>`);
    });

    return <div dangerouslySetInnerHTML={{ __html: highlightedHtml.replace(/\n/g, '<br/>') }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0 }}>Similarity Report</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>{doc?.title} • {doc?.uploaded_by?.username}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      {/* Main Content: Split View */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Pane: Submitted Document */}
        <div style={{ flex: '1', padding: '32px', overflowY: 'auto', borderRight: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--color-primary)" /> Submitted Text
          </h2>
          
          <div className="glass-card" style={{ padding: '32px', fontSize: '15px', lineHeight: '1.8', color: '#cbd5e1' }}>
            {renderHighlightedText(reportData.submission_text, reportData.matches || [])}
          </div>
        </div>

        {/* Right Pane: Report Analysis & Sources */}
        <div style={{ width: '400px', padding: '32px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.5)' }}>
          
          {/* Circular Progress Score */}
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              background: `conic-gradient(var(--color-danger) ${overallSimilarity}%, var(--color-surface) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-danger)' }}>{overallSimilarity}%</span>
              </div>
            </div>
            {reportData.grade && (
              <div style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Grade: <span style={{ color: reportData.grade === 'A' ? 'var(--color-success)' : reportData.grade === 'D' ? 'var(--color-danger)' : 'var(--color-warning)' }}>{reportData.grade}</span>
              </div>
            )}
            <h3 style={{ margin: '0 0 8px' }}>Analysis Overview</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {overallSimilarity < 15 ? "This document appears highly original with minimal text overlap." : "The engine has detected structural overlap with other documents. Please review the highlighted segments."}
            </p>
          </div>

          {/* Matched Sources */}
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={16} color="var(--color-warning)" /> Matched Sources
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reportData.matches && reportData.matches.length > 0 ? (
              reportData.matches.map((match, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '16px', borderLeft: `3px solid ${match.similarity > 30 ? 'var(--color-danger)' : 'var(--color-warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: match.similarity > 30 ? '#fca5a5' : '#fcd34d' }}>{match.source_doc_title || 'Unknown Document'} (ID: {match.source_doc_id})</span>
                    <span style={{ fontWeight: 'bold', color: match.similarity > 30 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{match.similarity}%</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{match.notes}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No internal similarities found.</p>
            )}
          </div>
          
          {/* Info Card */}
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', marginTop: '32px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Highlights in <span style={{ color: '#fca5a5' }}>red</span> indicate direct copy-pasting. 
              Highlights in <span style={{ color: '#fcd34d' }}>yellow</span> indicate heavy paraphrasing or structural similarity.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportView;
